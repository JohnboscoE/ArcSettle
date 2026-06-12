import { Router, Request, Response } from 'express';
import { db } from '../data/store';

const router = Router();

// GET /api/pos — list all purchase orders
router.get('/', (_req: Request, res: Response) => {
  res.json({ purchaseOrders: db.getPurchaseOrders() });
});

// GET /api/pos/:id — get single PO
router.get('/:id', (req: Request, res: Response) => {
  const po = db.getPOById(String(req.params.id));
  if (!po) return res.status(404).json({ error: 'PO not found' });
  res.json({ po });
});

// GET /api/suppliers — list all suppliers
router.get('/suppliers', (_req: Request, res: Response) => {
  res.json({ suppliers: db.getSuppliers() });
});

export default router;
