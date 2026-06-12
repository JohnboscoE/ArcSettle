import React, { useEffect, useState } from 'react';
import { invoicesApi, settlementApi, posApi } from '../api';
import { Invoice, PurchaseOrder } from '../types';
import { Card, Button, StatusBadge, SectionHeader, EmptyState, Spinner } from '../components/ui';

const SUPPLIERS = [
  { id: 'sup-001', name: 'AlMansoori Industrial Supply' },
  { id: 'sup-002', name: 'Nile Tech Components' },
  { id: 'sup-003', name: 'Lagos Freight & Logistics' },
  { id: 'sup-004', name: 'Karachi Steel Works' },
  { id: 'sup-005', name: 'Riyadh Office Supplies Co.' },
];

const input: React.CSSProperties = {
  width: '100%', background: 'var(--bg-raised)',
  border: '0.5px solid var(--border)', borderRadius: 6,
  padding: '7px 10px', fontSize: 13, color: 'var(--text-1)',
  fontFamily: 'var(--font-sans)', outline: 'none',
};

const label: React.CSSProperties = {
  fontSize: 11, color: 'var(--text-3)', fontWeight: 500,
  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5, display: 'block',
};

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

  const getPO = (ref?: string) => pos.find(p => p.id === ref);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 40, color: 'var(--text-3)' }}>
      <Spinner /> Loading invoices…
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Invoices</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{invoices.length} invoices · agent processes each against PO register</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">+ New invoice</Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <SectionHeader title="Create invoice" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <span style={label}>Supplier</span>
              <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} style={input}>
                {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>Invoice number</span>
              <input style={input} placeholder="INV-2026-001" value={form.invoiceNumber}
                onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Amount (USD)</span>
              <input style={input} type="number" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <span style={label}>PO reference</span>
              <select value={form.poReference} onChange={e => setForm(f => ({ ...f, poReference: e.target.value }))} style={input}>
                <option value="">— none —</option>
                {pos.map(p => <option key={p.id} value={p.id}>{p.id} — {p.supplierName}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>Issue date</span>
              <input style={input} type="date" value={form.issueDate}
                onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Due date</span>
              <input style={input} type="date" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button onClick={handleCreate} loading={submitting}>Submit invoice</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Invoice table */}
      <Card style={{ padding: 0 }}>
        {invoices.length === 0
          ? <EmptyState message="No invoices yet" sub="Create an invoice above to get started" />
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Invoice', 'Supplier', 'Amount', 'PO match', 'Due date', 'Status', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-3)', fontWeight: 500, fontSize: 11, borderBottom: '0.5px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...invoices].reverse().map(inv => {
                  const po = getPO(inv.poReference);
                  const canProcess = inv.status === 'pending' || inv.status === 'matched' || inv.status === 'discrepancy';
                  return (
                    <tr key={inv.id} style={{ borderBottom: '0.5px solid var(--border-dim)' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 12 }}>
                        {inv.invoiceNumber}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-2)' }}>{inv.supplierName}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 16px', color: po ? 'var(--success)' : 'var(--text-3)', fontSize: 12 }}>
                        {po ? po.id : '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-3)', fontSize: 12 }}>{inv.dueDate || '—'}</td>
                      <td style={{ padding: '10px 16px' }}><StatusBadge status={inv.status} /></td>
                      <td style={{ padding: '10px 16px' }}>
                        {canProcess && (
                          <Button
                            variant="outline"
                            onClick={() => handleProcess(inv.id)}
                            loading={processing === inv.id}
                            style={{ fontSize: 12, padding: '4px 12px' }}
                          >
                            Run agent
                          </Button>
                        )}
                        {inv.status === 'paid' && (
                          <span style={{ fontSize: 11, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>✓ Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        }
      </Card>
    </div>
  );
};

export default Invoices;
