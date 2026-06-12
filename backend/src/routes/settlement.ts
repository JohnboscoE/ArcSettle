import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import { runAgent } from '../services/agentService';
import { settleInvoiceOnChain, getWalletBalance } from '../services/circleService';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// POST /api/settlement/process/:invoiceId
// Full pipeline: run agent → if PAY or PARTIAL_PAY → settle on Arc
router.post('/process/:invoiceId', async (req: Request, res: Response) => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const invoice = db.getInvoiceById(invoiceId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(400).json({ error: 'Invoice already settled' });

    // Step 1: Run AI agent reasoning
    console.log(`\nProcessing invoice ${invoice.invoiceNumber}...`);
    const agentLog = await runAgent(invoiceId);
    console.log(`Agent decision: ${agentLog.decision} — $${agentLog.amountToSettle}`);
    console.log(`Reasoning: ${agentLog.reasoning}`);

    // Step 2: Execute settlement if agent approved
    if (agentLog.decision === 'PAY' || agentLog.decision === 'PARTIAL_PAY') {
      const settlement = await settleInvoiceOnChain(invoice, agentLog);
      return res.json({
        message: 'Invoice processed and settled on Arc',
        agentLog,
        settlement,
        arcScanUrl: `https://testnet.arcscan.app/tx/${settlement.txHash}`,
      });
    }

    // HOLD or ESCALATE — no settlement, just return agent decision
    return res.json({
      message: `Invoice ${agentLog.decision.toLowerCase()} by agent — no settlement executed`,
      agentLog,
      settlement: null,
    });

  } catch (err: unknown) {
    console.error('Settlement error:', err);
    const message = err instanceof Error ? err.message : 'Settlement failed';
    res.status(500).json({ error: message });
  }
});

// GET /api/settlement — all settlements
router.get('/', (_req: Request, res: Response) => {
  res.json({ settlements: db.getSettlements() });
});

// GET /api/settlement/balances — wallet balances from Circle
router.get('/balances', async (_req: Request, res: Response) => {
  try {
    const configPath = path.join(__dirname, '../../wallets.json');
    const walletConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const buyerBalance = await getWalletBalance(walletConfig.buyer.id);
    const supplierBalances: Record<string, number> = {};

    for (const [supplierId, wallet] of Object.entries(walletConfig.suppliers)) {
      const w = wallet as { id: string; address: string };
      supplierBalances[supplierId] = await getWalletBalance(w.id);
    }

    res.json({
      buyer: { address: walletConfig.buyer.address, balanceUsdc: buyerBalance },
      suppliers: supplierBalances,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch balances';
    res.status(500).json({ error: message });
  }
});

export default router;
