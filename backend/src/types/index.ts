export type InvoiceStatus = 'pending' | 'matched' | 'discrepancy' | 'paid' | 'partial_paid' | 'held' | 'escalated';

export type AgentDecision = 'PAY' | 'PARTIAL_PAY' | 'HOLD' | 'ESCALATE' | 'PENDING';

export interface Supplier {
  id: string;
  name: string;
  walletAddress: string;
  country: string;
  currency: string;
  reliabilityScore: number; // 0-100
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  currency: string;
  description: string;
  issuedDate: string;
  dueDate: string;
  deliveryConfirmed: boolean;
  items: POLineItem[];
}

export interface POLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

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
  items: InvoiceLineItem[];
  rawText?: string;
  status: InvoiceStatus;
  uploadedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface MatchResult {
  invoiceId: string;
  matchedPOId: string | null;
  matchConfidence: number; // 0-100
  discrepancies: Discrepancy[];
  suggestedDecision: AgentDecision;
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

export interface SettlementRecord {
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
