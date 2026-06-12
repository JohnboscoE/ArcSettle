import { Invoice, AgentLog, SettlementRecord } from '../types';
import { suppliers, purchaseOrders } from './seed';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '../../db.json');

interface DbShape {
  invoices: Invoice[];
  agentLogs: AgentLog[];
  settlementRecords: SettlementRecord[];
}

function loadDb(): DbShape {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch { /* corrupt file — start fresh */ }
  return { invoices: [], agentLogs: [], settlementRecords: [] };
}

function saveDb(data: DbShape): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to persist db:', err);
  }
}

// Load on startup
let { invoices, agentLogs, settlementRecords } = loadDb();

export const db = {
  // Suppliers (read-only seed)
  getSuppliers: () => suppliers,
  getSupplierById: (id: string) => suppliers.find(s => s.id === id) ?? null,

  // Purchase Orders (read-only seed)
  getPurchaseOrders: () => purchaseOrders,
  getPOById: (id: string) => purchaseOrders.find(po => po.id === id) ?? null,
  getPOsBySupplier: (supplierId: string) => purchaseOrders.filter(po => po.supplierId === supplierId),

  // Invoices
  getInvoices: () => invoices,
  getInvoiceById: (id: string) => invoices.find(inv => inv.id === id) ?? null,
  addInvoice: (invoice: Invoice) => {
    invoices.push(invoice);
    saveDb({ invoices, agentLogs, settlementRecords });
    return invoice;
  },
  updateInvoice: (id: string, updates: Partial<Invoice>) => {
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx === -1) return null;
    invoices[idx] = { ...invoices[idx], ...updates };
    saveDb({ invoices, agentLogs, settlementRecords });
    return invoices[idx];
  },

  // Agent Logs
  getAgentLogs: () => agentLogs,
  getAgentLogsByInvoice: (invoiceId: string) => agentLogs.filter(l => l.invoiceId === invoiceId),
  addAgentLog: (log: AgentLog) => {
    agentLogs.push(log);
    saveDb({ invoices, agentLogs, settlementRecords });
    return log;
  },

  // Settlement Records
  getSettlements: () => settlementRecords,
  addSettlement: (record: SettlementRecord) => {
    settlementRecords.push(record);
    saveDb({ invoices, agentLogs, settlementRecords });
    return record;
  },

  // Dashboard summary
  getSummary: () => ({
    totalInvoices: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    held: invoices.filter(i => i.status === 'held').length,
    escalated: invoices.filter(i => i.status === 'escalated').length,
    totalSettled: settlementRecords
      .filter(s => s.status === 'success')
      .reduce((sum, s) => sum + s.amountUsdc, 0),
  }),
};
