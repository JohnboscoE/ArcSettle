import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import { runAgent } from '../services/agentService';

const router = Router();

// POST /api/agent/process/:invoiceId — run agent on a specific invoice
router.post('/process/:invoiceId', async (req: Request, res: Response) => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const invoice = db.getInvoiceById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Invoice already settled' });
    }

    const agentLog = await runAgent(invoiceId);

    res.json({
      message: 'Agent processing complete',
      agentLog,
      invoice: db.getInvoiceById(invoiceId),
    });
  } catch (err: unknown) {
    console.error('Agent error:', err);
    const message = err instanceof Error ? err.message : 'Agent processing failed';
    res.status(500).json({ error: message });
  }
});

// GET /api/agent/logs — all agent logs
router.get('/logs', (_req: Request, res: Response) => {
  res.json({ logs: db.getAgentLogs() });
});

// GET /api/agent/logs/:invoiceId — logs for a specific invoice
router.get('/logs/:invoiceId', (req: Request, res: Response) => {
  const logs = db.getAgentLogsByInvoice(String(req.params.invoiceId));
  res.json({ logs });
});

export default router;