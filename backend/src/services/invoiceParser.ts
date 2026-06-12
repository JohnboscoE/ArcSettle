import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceLineItem } from '../types';

// Parses raw PDF text into structured invoice fields
// In production this would use a more robust extractor;
// for the hackathon we also support direct JSON upload
export function parseInvoiceText(rawText: string, filename: string): Partial<Invoice> {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const extract = (pattern: RegExp): string | undefined => {
    for (const line of lines) {
      const m = line.match(pattern);
      if (m) return m[1]?.trim();
    }
    return undefined;
  };

  const invoiceNumber = extract(/invoice\s*#?\s*[:\-]?\s*([A-Z0-9\-]+)/i) ?? `INV-${Date.now()}`;
  const amount = parseFloat(extract(/total\s*[:\-]?\s*\$?([\d,]+\.?\d*)/i)?.replace(',', '') ?? '0');
  const currency = extract(/(USD|AED|EUR|GBP|NGN|EGP)/i)?.toUpperCase() ?? 'USD';
  const poRef = extract(/p\.?o\.?\s*(?:number|ref|reference)?\s*[:\-]?\s*([A-Z0-9\-]+)/i);
  const supplierName = extract(/from\s*[:\-]?\s*(.+)/i) ?? extract(/supplier\s*[:\-]?\s*(.+)/i) ?? 'Unknown Supplier';
  const dueDate = extract(/due\s*date?\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i) ?? '';
  const issueDate = extract(/(?:invoice\s*)?date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i) ?? new Date().toISOString().split('T')[0];

  return {
    invoiceNumber,
    amount,
    currency,
    poReference: poRef,
    supplierName,
    dueDate: normalizeDate(dueDate),
    issueDate: normalizeDate(issueDate),
    rawText,
  };
}

function normalizeDate(raw: string): string {
  if (!raw) return '';
  if (raw.includes('/')) {
    const [d, m, y] = raw.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return raw;
}

// Builds a full Invoice object from parsed fields + supplier lookup
export function buildInvoice(
  parsed: Partial<Invoice>,
  supplierId: string,
  items: InvoiceLineItem[] = []
): Invoice {
  return {
    id: uuidv4(),
    supplierId,
    supplierName: parsed.supplierName ?? 'Unknown',
    invoiceNumber: parsed.invoiceNumber ?? `INV-${uuidv4().slice(0, 8).toUpperCase()}`,
    amount: parsed.amount ?? 0,
    currency: parsed.currency ?? 'USD',
    description: parsed.description ?? '',
    issueDate: parsed.issueDate ?? new Date().toISOString().split('T')[0],
    dueDate: parsed.dueDate ?? '',
    poReference: parsed.poReference,
    items,
    rawText: parsed.rawText,
    status: 'pending',
    uploadedAt: new Date().toISOString(),
  };
}
