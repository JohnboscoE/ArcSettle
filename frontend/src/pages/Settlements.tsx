import React, { useEffect, useState } from 'react';
import { settlementApi } from '../api';
import { Settlement } from '../types';
import { Card, EmptyState, Spinner } from '../components/ui';

const Settlements: React.FC = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settlementApi.list().then(res => setSettlements(res.data.settlements ?? [])).finally(() => setLoading(false));
  }, []);

  const total = settlements.filter(s => s.status === 'success').reduce((sum, s) => sum + s.amountUsdc, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 40, color: 'var(--text-3)' }}>
      <Spinner /> Loading settlements…
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Settlements</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>
          {settlements.length} settlement{settlements.length !== 1 ? 's' : ''} · ${total.toLocaleString()} USDC total
        </p>
      </div>

      <Card style={{ padding: 0 }}>
        {settlements.length === 0
          ? <EmptyState message="No settlements yet" sub="Processed invoices with PAY decisions will appear here" />
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Invoice', 'Buyer wallet', 'Supplier wallet', 'Amount (USDC)', 'Settled at', 'Arc TX', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-3)', fontWeight: 500, fontSize: 11, borderBottom: '0.5px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...settlements].reverse().map(s => (
                  <tr key={s.id} style={{ borderBottom: '0.5px solid var(--border-dim)' }}>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>
                      {s.invoiceId.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                      {s.buyerWallet.slice(0, 8)}…{s.buyerWallet.slice(-4)}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                      {s.supplierWallet.slice(0, 8)}…{s.supplierWallet.slice(-4)}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                      ${s.amountUsdc.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-3)', fontSize: 12 }}>
                      {new Date(s.settledAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <a href={`https://testnet.arcscan.app/tx/${s.txHash}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        {s.txHash.slice(0, 10)}… ↗
                      </a>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                        background: s.status === 'success' ? 'var(--success-dim)' : 'var(--danger-dim)',
                        color: s.status === 'success' ? 'var(--success)' : 'var(--danger)',
                      }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Card>
    </div>
  );
};

export default Settlements;
