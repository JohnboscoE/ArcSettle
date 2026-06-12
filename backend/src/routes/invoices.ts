import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/store';
import { parseInvoiceText, buildInvoice } from '../services/invoiceParser';
import { matchInvoiceToPO } from '../services/poMatcher';
import { Invoice } from '../types';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/json'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// GET /api/invoices — list all invoices
router.get('/', (_req: Request, res: Response) => {
  res.json({ invoices: db.getInvoices() });
});

// GET /api/invoices/:id — get single invoice
router.get('/:id', (req: Request, res: Response) => {
  const invoice = db.getInvoiceById(String(req.params.id));
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ invoice });
});

// POST /api/invoices/upload — upload PDF or JSON invoice
router.post('/upload', upload.single('invoice'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let invoiceData: Partial<Invoice> = {};

    if (req.file.mimetype === 'application/json') {
      const raw = fs.readFileSync(req.file.path, 'utf-8');
      const parsed = JSON.parse(raw);
      invoiceData = parsed;
    } else {
      // PDF: dynamic import to avoid type issues
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(buffer);
      invoiceData = parseInvoiceText(pdfData.text, req.file.originalname);
    }

    // supplierId can come from the form body or be inferred from parsed data
    const supplierId = req.body.supplierId ?? 'sup-001';
    const supplier = db.getSupplierById(supplierId);
    if (!supplier) {
      return res.status(400).json({ error: `Supplier ${supplierId} not found` });
    }

    invoiceData.supplierName = supplier.name;
    const invoice = buildInvoice(invoiceData, supplierId, invoiceData.items ?? []);
    db.addInvoice(invoice);

    // Immediately run PO matching
    const matchResult = matchInvoiceToPO(invoice);

    res.status(201).json({
      message: 'Invoice uploaded and matched',
      invoice,
      matchResult,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process invoice' });
  }
});

// POST /api/invoices/manual — create invoice from JSON body (useful for demo/testing)
router.post('/manual', (req: Request, res: Response) => {
  try {
    const { supplierId, ...invoiceData } = req.body;
    if (!supplierId) return res.status(400).json({ error: 'supplierId required' });

    const supplier = db.getSupplierById(supplierId);
    if (!supplier) return res.status(400).json({ error: 'Supplier not found' });

    invoiceData.supplierName = supplier.name;
    const invoice = buildInvoice(invoiceData, supplierId, invoiceData.items ?? []);
    db.addInvoice(invoice);

    const matchResult = matchInvoiceToPO(invoice);

    res.status(201).json({ message: 'Invoice created', invoice, matchResult });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router;
