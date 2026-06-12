import { Router, Request, Response } from 'express';
import { db } from '../data/store';

const router = Router();

// GET /api/dashboard — summary stats
router.get('/', (_req: Request, res: Response) => {
  res.json({
    summary: db.getSummary(),
    recentInvoices: db.getInvoices().slice(-5).reverse(),
    recentLogs: db.getAgentLogs().slice(-5).reverse(),
    recentSettlements: db.getSettlements().slice(-5).reverse(),
  });
});

export default router;
