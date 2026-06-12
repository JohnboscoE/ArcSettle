import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api';
import { Invoice, AgentLog, Settlement, DashboardSummary } from '../types';
import { MetricCard, Card, SectionHeader, DecisionBadge, StatusBadge, EmptyState, Spinner, PageHeader } from '../components/ui';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentLogs, setRecentLogs] = useState<AgentLog[]>([]);
  const [recentSettlements, setRecentSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getSummary().then(res => {
      setSummary(res.data.summary);
      setRecentInvoices(res.data.recentInvoices ?? []);
      setRecentLogs(res.data.recentLogs ?? []);
      setRecentSettlements(res.data.recentSettlements ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-t3">
      <Spinner /><span>Loading…</span>
    </div>
  );

  return (
    <div className="w-full max-w-full">
      <PageHeader title="Dashboard" sub="Autonomous invoice settlement · Arc & Circle" />

      {/* Agent banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-xl mb-6 bg-accent-dim border border-accent">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
          <span className="text-sm text-accent font-medium">Settlements execute autonomously — no wallet required</span>
        </div>
        <a href="https://testnet.arcscan.app/address/0x28c4c43bb4f3aed14901b90a7c8ef33354198ede"
          target="_blank" rel="noreferrer"
          className="text-[11px] font-mono text-accent truncate">
          0x28c4c43…198ede ↗
        </a>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total invoices"   value={summary?.totalInvoices ?? 0} />
        <MetricCard label="Settled (USDC)"   value={`$${(summary?.totalSettled ?? 0).toLocaleString()}`} accent />
        <MetricCard label="Pending"          value={summary?.pending ?? 0} sub="Awaiting agent" />
        <MetricCard label="Held / Escalated" value={(summary?.held ?? 0) + (summary?.escalated ?? 0)} danger />
      </div>

      {/* Recent invoices + agent decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <SectionHeader title="Recent invoices" />
          {recentInvoices.length === 0
            ? <EmptyState message="No invoices yet" sub="Submit an invoice to get started" />
            : recentInvoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-mono text-accent truncate">{inv.invoiceNumber}</div>
                  <div className="text-xs text-t3 truncate">{inv.supplierName}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="text-sm font-mono text-t1">${inv.amount.toLocaleString()}</div>
                  <div className="mt-0.5"><StatusBadge status={inv.status} /></div>
                </div>
              </div>
            ))
          }
        </Card>

        <Card>
          <SectionHeader title="Agent decisions" />
          {recentLogs.length === 0
            ? <EmptyState message="No agent decisions yet" sub="Process an invoice to see reasoning" />
            : recentLogs.map(log => (
              <div key={log.id} className="py-2.5 border-b border-border/40 last:border-0">
                <div className="flex justify-between items-center mb-1.5">
                  <DecisionBadge decision={log.decision} />
                  <span className="text-xs font-mono text-t3">${log.amountToSettle.toLocaleString()}</span>
                </div>
                <div className="text-xs text-t2 leading-relaxed line-clamp-2">{log.reasoning}</div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Settlements */}
      <Card>
        <SectionHeader title="Recent settlements" />
        {recentSettlements.length === 0
          ? <EmptyState message="No settlements yet" sub="Settled invoices will appear here with Arc transaction links" />
          : (
            <>
              {/* Mobile: cards */}
              <div className="sm:hidden space-y-3">
                {recentSettlements.map(s => (
                  <div key={s.id} className="bg-raised rounded-lg p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-t3">Amount</span>
                      <span className="text-sm font-mono text-accent font-semibold">${s.amountUsdc.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-t3">Supplier</span>
                      <span className="text-xs font-mono text-t2">{s.supplierWallet.slice(0,8)}…{s.supplierWallet.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-t3">TX</span>
                      <a href={`https://testnet.arcscan.app/tx/${s.txHash}`} target="_blank" rel="noreferrer"
                        className="text-xs font-mono text-accent">{s.txHash.slice(0,10)}… ↗</a>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      {['Supplier', 'Amount (USDC)', 'Settled at', 'Arc TX'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-[11px] text-t3 font-medium border-b border-border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentSettlements.map(s => (
                      <tr key={s.id} className="border-b border-border/30">
                        <td className="py-2.5 px-3 font-mono text-xs text-t2">{s.supplierWallet.slice(0,10)}…{s.supplierWallet.slice(-6)}</td>
                        <td className="py-2.5 px-3 font-mono text-accent font-semibold">${s.amountUsdc.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-xs text-t3">{new Date(s.settledAt).toLocaleString()}</td>
                        <td className="py-2.5 px-3">
                          <a href={`https://testnet.arcscan.app/tx/${s.txHash}`} target="_blank" rel="noreferrer"
                            className="text-xs font-mono text-accent hover:underline">{s.txHash.slice(0,10)}… ↗</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        }
      </Card>
    </div>
  );
};

export default Dashboard;
