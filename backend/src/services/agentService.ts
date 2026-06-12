import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { MatchResult, AgentLog, AgentDecision, Invoice, PurchaseOrder } from '../types';
import { db } from '../data/store';
import { matchInvoiceToPO } from './poMatcher';

const MOCK_MODE = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.trim() === '';

const SYSTEM_PROMPT = `You are ArcSettle, an autonomous B2B invoice settlement agent.
Your job is to review invoices against purchase orders, reason through any discrepancies, and decide how to settle using USDC on the Arc blockchain.

You must always respond with a valid JSON object — no prose, no markdown, no explanation outside the JSON.

Your response must follow this exact shape:
{
  "decision": "PAY" | "PARTIAL_PAY" | "HOLD" | "ESCALATE",
  "amountToSettle": <number in USD>,
  "reasoning": "<2-4 sentence explanation a finance manager could read and understand>",
  "confidenceScore": <0-100>,
  "flags": ["<flag1>", "<flag2>"]
}

Decision rules:
- PAY: Invoice matches PO cleanly or minor discrepancy (<3%) with delivery confirmed. Settle full invoice amount.
- PARTIAL_PAY: Invoice exceeds PO amount, or partial delivery confirmed. Settle PO amount only, hold excess.
- HOLD: Duplicate invoice detected, delivery unconfirmed, or active dispute on record. Do not settle until resolved.
- ESCALATE: No PO match found, high-severity unexplained discrepancy, or fraud indicators. Requires human review.

Be decisive. State the exact amount to settle. Reference specific numbers in your reasoning.`;

function buildUserPrompt(invoice: Invoice, po: PurchaseOrder | null, matchResult: MatchResult): string {
  const supplier = db.getSupplierById(invoice.supplierId);
  return `INVOICE TO PROCESS:
Invoice #: ${invoice.invoiceNumber}
Supplier: ${invoice.supplierName} (reliability score: ${supplier?.reliabilityScore ?? 'unknown'}/100)
Invoice amount: $${invoice.amount.toFixed(2)} ${invoice.currency}
Invoice date: ${invoice.issueDate}
Due date: ${invoice.dueDate}
PO reference: ${invoice.poReference ?? 'none provided'}
Line items: ${JSON.stringify(invoice.items, null, 2)}

${po ? `MATCHED PURCHASE ORDER:
PO ID: ${po.id}
PO amount: $${po.amount.toFixed(2)} ${po.currency}
Description: ${po.description}
Delivery confirmed: ${po.deliveryConfirmed}
Due date: ${po.dueDate}
PO line items: ${JSON.stringify(po.items, null, 2)}` : 'MATCHED PURCHASE ORDER: None found'}

MATCH ANALYSIS:
Confidence: ${matchResult.matchConfidence}%
Discrepancies detected: ${matchResult.discrepancies.length}
${matchResult.discrepancies.map(d =>
  `- [${d.severity.toUpperCase()}] ${d.field}: invoice="${d.invoiceValue}" vs PO="${d.poValue}" — ${d.note}`
).join('\n')}

Preliminary system suggestion: ${matchResult.suggestedDecision}

Make your final decision now.`;
}

// Deterministic mock responses for each scenario — used when no Anthropic key
function mockAgentResponse(matchResult: MatchResult, invoice: Invoice, po: PurchaseOrder | null): {
  decision: AgentDecision;
  amountToSettle: number;
  reasoning: string;
  confidenceScore: number;
  flags: string[];
} {
  const hasDuplicate = matchResult.discrepancies.some(d => d.field === 'duplicate');
  const hasDeliveryIssue = matchResult.discrepancies.some(d => d.field === 'delivery_confirmation');
  const hasNoMatch = !matchResult.matchedPOId;
  const amountDiff = po ? ((invoice.amount - po.amount) / po.amount) : 0;

  if (hasNoMatch) {
    return {
      decision: 'ESCALATE',
      amountToSettle: 0,
      reasoning: `No matching purchase order found for invoice ${invoice.invoiceNumber} from ${invoice.supplierName}. Amount of $${invoice.amount.toFixed(2)} cannot be verified against any open PO. Escalating to finance team for manual review before any settlement can proceed.`,
      confidenceScore: 0,
      flags: ['no_po_match', 'manual_review_required'],
    };
  }

  if (hasDuplicate) {
    return {
      decision: 'HOLD',
      amountToSettle: 0,
      reasoning: `Invoice ${invoice.invoiceNumber} appears to be a duplicate — PO ${po?.id} has already been settled. Holding payment pending supplier clarification. No USDC will be released until the supplier confirms this is a separate billable event.`,
      confidenceScore: 15,
      flags: ['duplicate_invoice', 'hold_pending_review'],
    };
  }

  if (hasDeliveryIssue) {
    return {
      decision: 'HOLD',
      amountToSettle: 0,
      reasoning: `Invoice ${invoice.invoiceNumber} references PO ${po?.id} for $${po?.amount.toFixed(2)}, but delivery has not been confirmed in the system. Withholding USDC settlement until goods or services are verified as received. Supplier ${invoice.supplierName} should update the delivery confirmation.`,
      confidenceScore: 30,
      flags: ['delivery_unconfirmed', 'hold_pending_delivery'],
    };
  }

  if (amountDiff > 0.03) {
    return {
      decision: 'PARTIAL_PAY',
      amountToSettle: po!.amount,
      reasoning: `Invoice ${invoice.invoiceNumber} bills $${invoice.amount.toFixed(2)} but PO ${po?.id} authorizes only $${po?.amount.toFixed(2)} — an overage of $${(invoice.amount - po!.amount).toFixed(2)} (${(amountDiff * 100).toFixed(1)}%). Settling the approved PO amount of $${po?.amount.toFixed(2)} USDC now. The excess requires separate PO authorization before release.`,
      confidenceScore: 78,
      flags: ['invoice_exceeds_po', 'excess_held'],
    };
  }

  return {
    decision: 'PAY',
    amountToSettle: invoice.amount,
    reasoning: `Invoice ${invoice.invoiceNumber} from ${invoice.supplierName} matches PO ${po?.id} with ${matchResult.matchConfidence}% confidence. Amount of $${invoice.amount.toFixed(2)} aligns with the authorized PO value and delivery is confirmed. Releasing full USDC settlement to supplier wallet.`,
    confidenceScore: matchResult.matchConfidence,
    flags: [],
  };
}

export async function runAgent(invoiceId: string): Promise<AgentLog> {
  const invoice = db.getInvoiceById(invoiceId);
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  const matchResult = matchInvoiceToPO(invoice);
  const po = matchResult.matchedPOId ? db.getPOById(matchResult.matchedPOId) : null;

  let parsed: {
    decision: AgentDecision;
    amountToSettle: number;
    reasoning: string;
    confidenceScore: number;
    flags: string[];
  };

  if (MOCK_MODE) {
    console.log('[Agent] Running in mock mode — add ANTHROPIC_API_KEY to enable live reasoning');
    parsed = mockAgentResponse(matchResult, invoice, po);
  } else {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(invoice, po, matchResult) }],
    });

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error(`Agent returned invalid JSON: ${rawText}`);
    }
  }

  const agentLog: AgentLog = {
    id: uuidv4(),
    invoiceId: invoice.id,
    poId: matchResult.matchedPOId,
    decision: parsed.decision,
    reasoning: parsed.reasoning,
    discrepancies: matchResult.discrepancies,
    amountToSettle: parsed.amountToSettle,
    timestamp: new Date().toISOString(),
  };

  db.addAgentLog(agentLog);

  const statusMap: Record<AgentDecision, Invoice['status']> = {
    PAY: 'matched',
    PARTIAL_PAY: 'discrepancy',
    HOLD: 'held',
    ESCALATE: 'escalated',
    PENDING: 'pending',
  };
  db.updateInvoice(invoiceId, { status: statusMap[parsed.decision] });

  return agentLog;
}
