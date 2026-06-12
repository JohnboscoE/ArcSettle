export type InvoiceStatus = 'pending' | 'matched' | 'discrepancy' | 'paid' | 'partial_paid' | 'held' | 'escalated';
export type AgentDecision = 'PAY' | 'PARTIAL_PAY' | 'HOLD' | 'ESCALATE' | 'PENDING';

export interface Invoice {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  description: string;
  issueDate: string;
  dueDate: string;
  poReference?: string;
  status: InvoiceStatus;
  uploadedAt: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  currency: string;
  description: string;
  dueDate: string;
  deliveryConfirmed: boolean;
}

export interface Discrepancy {
  field: string;
  invoiceValue: string | number;
  poValue: string | number;
  severity: 'low' | 'medium' | 'high';
  note: string;
}

export interface AgentLog {
  id: string;
  invoiceId: string;
  poId: string | null;
  decision: AgentDecision;
  reasoning: string;
  discrepancies: Discrepancy[];
  amountToSettle: number;
  timestamp: string;
  onChainTxHash?: string;
}

export interface Settlement {
  id: string;
  invoiceId: string;
  agentLogId: string;
  supplierWallet: string;
  buyerWallet: string;
  amountUsdc: number;
  txHash: string;
  settledAt: string;
  status: 'success' | 'failed' | 'pending';
}

export interface DashboardSummary {
  totalInvoices: number;
  pending: number;
  paid: number;
  held: number;
  escalated: number;
  totalSettled: number;
}
