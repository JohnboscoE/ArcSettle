import { Invoice, PurchaseOrder, MatchResult, Discrepancy, AgentDecision } from '../types';
import { db } from '../data/store';

const AMOUNT_TOLERANCE_PCT = 0.05; // 5% tolerance before flagging discrepancy

export function matchInvoiceToPO(invoice: Invoice): MatchResult {
  const discrepancies: Discrepancy[] = [];

  // 1. Try exact PO reference match first
  let po: PurchaseOrder | null = null;
  if (invoice.poReference) {
    po = db.getPOById(invoice.poReference);
  }

  // 2. Fall back to supplier + amount proximity match
  if (!po) {
    const supplierPOs = db.getPOsBySupplier(invoice.supplierId);
    po = supplierPOs.find(p => {
      const diff = Math.abs(p.amount - invoice.amount) / p.amount;
      return diff <= 0.20; // within 20% of PO amount
    }) ?? null;
  }

  if (!po) {
    return {
      invoiceId: invoice.id,
      matchedPOId: null,
      matchConfidence: 0,
      discrepancies: [{
        field: 'purchase_order',
        invoiceValue: invoice.poReference ?? 'none',
        poValue: 'no match found',
        severity: 'high',
        note: 'No matching PO found for this supplier and amount',
      }],
      suggestedDecision: 'ESCALATE',
    };
  }

  let confidence = 100;

  // Check: delivery confirmed
  if (!po.deliveryConfirmed) {
    discrepancies.push({
      field: 'delivery_confirmation',
      invoiceValue: 'invoiced',
      poValue: 'not confirmed',
      severity: 'high',
      note: 'Goods or services not yet confirmed as delivered',
    });
    confidence -= 40;
  }

  // Check: amount match
  const amountDiff = invoice.amount - po.amount;
  const amountDiffPct = Math.abs(amountDiff) / po.amount;

  if (amountDiffPct > AMOUNT_TOLERANCE_PCT) {
    const severity = amountDiffPct > 0.15 ? 'high' : amountDiffPct > 0.05 ? 'medium' : 'low';
    discrepancies.push({
      field: 'amount',
      invoiceValue: invoice.amount,
      poValue: po.amount,
      severity,
      note: `Invoice is ${amountDiff > 0 ? 'over' : 'under'} PO by ${(amountDiffPct * 100).toFixed(1)}% ($${Math.abs(amountDiff).toFixed(2)})`,
    });
    confidence -= severity === 'high' ? 35 : severity === 'medium' ? 20 : 10;
  }

  // Check: currency match
  if (invoice.currency !== po.currency) {
    discrepancies.push({
      field: 'currency',
      invoiceValue: invoice.currency,
      poValue: po.currency,
      severity: 'medium',
      note: 'Currency mismatch — FX conversion may be required',
    });
    confidence -= 15;
  }

  // Check: duplicate invoice detection
  const existingPaid = db.getInvoices().filter(
    inv => inv.supplierId === invoice.supplierId &&
           inv.poReference === po!.id &&
           (inv.status === 'paid' || inv.status === 'partial_paid') &&
           inv.id !== invoice.id
  );
  if (existingPaid.length > 0) {
    discrepancies.push({
      field: 'duplicate',
      invoiceValue: invoice.invoiceNumber,
      poValue: existingPaid.map(i => i.invoiceNumber).join(', '),
      severity: 'high',
      note: `PO ${po.id} has already been settled by invoice(s): ${existingPaid.map(i => i.invoiceNumber).join(', ')}`,
    });
    confidence -= 50;
  }

  // Suggest decision based on discrepancies
  const suggestedDecision = suggestDecision(discrepancies, confidence, po, invoice);

  return {
    invoiceId: invoice.id,
    matchedPOId: po.id,
    matchConfidence: Math.max(0, confidence),
    discrepancies,
    suggestedDecision,
  };
}

function suggestDecision(
  discrepancies: Discrepancy[],
  confidence: number,
  po: PurchaseOrder,
  invoice: Invoice
): AgentDecision {
  const hasHighSeverity = discrepancies.some(d => d.severity === 'high');
  const hasDuplicate = discrepancies.some(d => d.field === 'duplicate');
  const hasDeliveryIssue = discrepancies.some(d => d.field === 'delivery_confirmation');
  const hasAmountOver = invoice.amount > po.amount * 1.05;

  if (hasDuplicate) return 'HOLD';
  if (hasDeliveryIssue) return 'HOLD';
  if (hasHighSeverity && confidence < 50) return 'ESCALATE';
  if (hasAmountOver) return 'PARTIAL_PAY'; // pay PO amount, hold excess
  if (discrepancies.length === 0) return 'PAY';
  if (confidence >= 75) return 'PAY'; // minor discrepancies, still pay
  return 'ESCALATE';
}
