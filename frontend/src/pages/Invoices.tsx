import React, { useEffect, useState } from 'react';
import { invoicesApi, settlementApi, posApi } from '../api';
import { Invoice, PurchaseOrder } from '../types';
import { Card, Button, StatusBadge, SectionHeader, EmptyState, Spinner, PageHeader } from '../components/ui';

const SUPPLIERS = [
  { id: 'sup-001', name: 'AlMansoori Industrial Supply' },
  { id: 'sup-002', name: 'Nile Tech Components' },
  { id: 'sup-003', name: 'Lagos Freight & Logistics' },
  { id: 'sup-004', name: 'Karachi Steel Works' },
  { id: 'sup-005', name: 'Riyadh Office Supplies Co.' },
];

const inputCls = 'w-full bg-raised border border-border rounded-lg px-3 py-2 text-sm text-t1 outline-none focus:border-accent transition-colors font-sans';
const labelCls = 'text-[11px] text-t3 font-medium tracking-wide uppercase mb-1.5 block';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    supplierId: 'sup-001', invoiceNumber: '', amount: '',
    poReference: '', issueDate: '', dueDate: '',
  });

  const load = () => {
    Promise.all([invoicesApi.list(), posApi.list()]).then(([invRes, poRes]) => {
      setInvoices(invRes.data.invoices ?? []);
      setPos(poRes.data.purchaseOrders ?? []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.invoiceNumber || !form.amount) return;
    setSubmitting(true);
    try {
      await invoicesApi.create({
        supplierId: form.supplierId,
        invoiceNumber: form.invoiceNumber,
        amount: parseFloat(form.amount),
        currency: 'USD',
        poReference: form.poReference || undefined,
        issueDate: form.issueDate || new Date().toISOString().split('T')[0],
        dueDate: form.dueDate,
        items: [],
      });
      setShowForm(false);
      setForm({ supplierId: 'sup-001', invoiceNumber: '', amount: '', poReference: '', issueDate: '', dueDate: '' });
      load();
    } finally { setSubmitting(false); }
  };

  const handleProcess = async (invoiceId: string) => {
    setProcessing(invoiceId);
    try {
      await settlementApi.process(invoiceId);
      load();
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Processing failed');
    } finally { setProcessing(null); }
  };

  if (loading) return (
    <div className="flex items-center gap-3 p-10 text-t3"><Spinner /> Loading invoices…</div>
  );

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="Invoices"
        sub={`${invoices.length} invoices · agent processes each against PO register`}
        action={<Button onClick={() => setShowForm(!showForm)}>+ New invoice</Button>}
      />

      {/* Create form */}
      {showForm && (
        <Card className="mb-5">
          <SectionHeader title="Create invoice" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Supplier</label>
              <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} className={inputCls}>
                {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Invoice number</label>
              <input className={inputCls} placeholder="INV-2026-001" value={form.invoiceNumber}
                onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Amount (USD)</label>
              <input className={inputCls} type="number" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>PO reference</label>
              <select value={form.poReference} onChange={e => setForm(f => ({ ...f, poReference: e.target.value }))} className={inputCls}>
                <option value="">— none —</option>
                {pos.map(p => <option key={p.id} value={p.id}>{p.id} — {p.supplierName}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Issue date</label>
              <input className={inputCls} type="date" value={form.issueDate}
                onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Due date</label>
              <input className={inputCls} type="date" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button onClick={handleCreate} loading={submitting}>Submit invoice</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Mobile: invoice cards */}
      <div className="sm:hidden space-y-3">
        {invoices.length === 0
          ? <Card><EmptyState message="No invoices yet" sub="Create an invoice above" /></Card>
          : [...invoices].reverse().map(inv => {
            const canProcess = ['pending', 'matched', 'discrepancy'].includes(inv.status);
            return (
              <Card key={inv.id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-mono text-accent">{inv.invoiceNumber}</div>
                    <div className="text-xs text-t3 mt-0.5">{inv.supplierName}</div>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-mono font-semibold text-t1">${inv.amount.toLocaleString()}</div>
                    <div className="text-xs text-t3">{inv.dueDate ? `Due ${inv.dueDate}` : 'No due date'}</div>
                  </div>
                  {canProcess && (
                    <Button variant="outline" onClick={() => handleProcess(inv.id)} loading={processing === inv.id} className="text-xs px-3 py-1">
                      Run agent
                    </Button>
                  )}
                  {inv.status === 'paid' && <span className="text-xs text-success font-mono">✓ Settled</span>}
                </div>
              </Card>
            );
          })
        }
      </div>

      {/* Desktop: table */}
      <Card className="hidden sm:block p-0 overflow-hidden">
        {invoices.length === 0
          ? <EmptyState message="No invoices yet" sub="Create an invoice above to get started" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {['Invoice', 'Supplier', 'Amount', 'PO match', 'Due date', 'Status', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[11px] text-t3 font-medium border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...invoices].reverse().map(inv => {
                    const po = pos.find(p => p.id === inv.poReference);
                    const canProcess = ['pending', 'matched', 'discrepancy'].includes(inv.status);
                    return (
                      <tr key={inv.id} className="border-b border-border/30 hover:bg-raised/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-accent text-xs">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 text-t2">{inv.supplierName}</td>
                        <td className="py-3 px-4 font-mono text-t1 font-medium">${inv.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-xs text-success">{po ? po.id : <span className="text-t3">—</span>}</td>
                        <td className="py-3 px-4 text-xs text-t3">{inv.dueDate || '—'}</td>
                        <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                        <td className="py-3 px-4">
                          {canProcess && (
                            <Button variant="outline" onClick={() => handleProcess(inv.id)} loading={processing === inv.id} className="text-xs px-3 py-1">
                              Run agent
                            </Button>
                          )}
                          {inv.status === 'paid' && <span className="text-xs text-success font-mono">✓ Settled</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </Card>
    </div>
  );
};

export default Invoices;
