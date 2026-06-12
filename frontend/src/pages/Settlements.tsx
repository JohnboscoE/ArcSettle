import React, { useEffect, useState } from 'react';
import { settlementApi } from '../api';
import { Settlement } from '../types';
import { Card, EmptyState, Spinner, PageHeader } from '../components/ui';

const Settlements: React.FC = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settlementApi.list().then(res => setSettlements(res.data.settlements ?? [])).finally(() => setLoading(false));
  }, []);

  const total = settlements.filter(s => s.status === 'success').reduce((sum, s) => sum + s.amountUsdc, 0);

  if (loading) return (
    <div className="flex items-center gap-3 p-10 text-t3"><Spinner /> Loading settlements…</div>
  );

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="Settlements"
        sub={`${settlements.length} settlement${settlements.length !== 1 ? 's' : ''} · $${total.toLocaleString()} USDC total`}
      />

      {/* Mobile: cards */}
      <div className="sm:hidden space-y-3">
        {settlements.length === 0
          ? <Card><EmptyState message="No settlements yet" sub="Processed PAY decisions will appear here" /></Card>
          : [...settlements].reverse().map(s => (
            <Card key={s.id}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xl font-mono font-semibold text-accent">${s.amountUsdc.toLocaleString()}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${s.status === 'success' ? 'bg-success-dim text-success' : 'bg-danger-dim text-danger'}`}>
                  {s.status}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-t3">Buyer</span>
                  <span className="text-xs font-mono text-t2">{s.buyerWallet.slice(0,8)}…{s.buyerWallet.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-t3">Supplier</span>
                  <span className="text-xs font-mono text-t2">{s.supplierWallet.slice(0,8)}…{s.supplierWallet.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-t3">Settled</span>
                  <span className="text-xs text-t3">{new Date(s.settledAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-t3">Arc TX</span>
                  <a href={`https://testnet.arcscan.app/tx/${s.txHash}`} target="_blank" rel="noreferrer"
                    className="text-xs font-mono text-accent hover:underline">{s.txHash.slice(0,12)}… ↗</a>
                </div>
              </div>
            </Card>
          ))
        }
      </div>

      {/* Desktop: table */}
      <Card className="hidden sm:block p-0 overflow-hidden">
        {settlements.length === 0
          ? <EmptyState message="No settlements yet" sub="Processed PAY decisions will appear here" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {['Buyer wallet', 'Supplier wallet', 'Amount (USDC)', 'Settled at', 'Arc TX', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[11px] text-t3 font-medium border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...settlements].reverse().map(s => (
                    <tr key={s.id} className="border-b border-border/30 hover:bg-raised/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-t3">{s.buyerWallet.slice(0,8)}…{s.buyerWallet.slice(-4)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-t3">{s.supplierWallet.slice(0,8)}…{s.supplierWallet.slice(-4)}</td>
                      <td className="py-3 px-4 font-mono text-accent font-semibold">${s.amountUsdc.toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs text-t3">{new Date(s.settledAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <a href={`https://testnet.arcscan.app/tx/${s.txHash}`} target="_blank" rel="noreferrer"
                          className="text-xs font-mono text-accent hover:underline">{s.txHash.slice(0,10)}… ↗</a>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${s.status === 'success' ? 'bg-success-dim text-success' : 'bg-danger-dim text-danger'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Card>
    </div>
  );
};

export default Settlements;
