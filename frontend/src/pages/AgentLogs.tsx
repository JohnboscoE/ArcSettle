import React, { useEffect, useState } from 'react';
import { agentApi } from '../api';
import { AgentLog } from '../types';
import { Card, DecisionBadge, SectionHeader, EmptyState, Spinner, PageHeader } from '../components/ui';

const severityColor: Record<string, string> = {
  low: 'text-accent', medium: 'text-warning', high: 'text-danger'
};

const AgentLogs: React.FC = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    agentApi.getLogs().then(res => setLogs(res.data.logs ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 p-10 text-t3"><Spinner /> Loading agent logs…</div>
  );

  return (
    <div className="w-full max-w-full">
      <PageHeader
        title="Agent logs"
        sub="Every decision logged with full reasoning — immutable audit trail on Arc"
      />

      {logs.length === 0
        ? <Card><EmptyState message="No agent decisions yet" sub="Process an invoice to see the agent's reasoning" /></Card>
        : [...logs].reverse().map(log => (
          <div key={log.id} onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            className="bg-card border border-border rounded-xl p-4 mb-3 cursor-pointer hover:border-accent/30 transition-colors">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <DecisionBadge decision={log.decision} />
                <div>
                  <div className="text-xs font-mono text-t3">
                    {log.invoiceId.slice(0, 8)}… · {log.poId ?? 'no PO'}
                  </div>
                  <div className="text-[11px] text-t3 mt-0.5">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-semibold font-mono text-accent">${log.amountToSettle.toLocaleString()}</div>
                <div className="text-[11px] text-t3">{log.discrepancies.length} discrepanc{log.discrepancies.length === 1 ? 'y' : 'ies'}</div>
              </div>
            </div>

            {/* Reasoning — always visible */}
            <div className="p-3 bg-raised rounded-lg border-l-2 border-accent text-sm text-t2 leading-relaxed">
              {log.reasoning}
            </div>

            {/* Expanded details */}
            {expanded === log.id && (
              <div className="mt-3 pt-3 border-t border-border/40">
                {log.discrepancies.length > 0 && (
                  <div className="mb-3">
                    <SectionHeader title="Discrepancies" />
                    {log.discrepancies.map((d, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border/30 last:border-0 gap-1">
                        <div>
                          <span className={`text-[10px] font-bold uppercase ${severityColor[d.severity]}`}>{d.severity}</span>
                          <span className="text-xs text-t2 ml-2">{d.field}</span>
                          <div className="text-xs text-t3 mt-0.5">{d.note}</div>
                        </div>
                        <div className="text-xs font-mono text-t2 sm:text-right flex-shrink-0">
                          <div>Invoice: {d.invoiceValue}</div>
                          <div className="text-t3">PO: {d.poValue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {log.onChainTxHash && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-t3">On-chain TX:</span>
                    <a href={`https://testnet.arcscan.app/tx/${log.onChainTxHash}`}
                      target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      className="text-xs font-mono text-accent hover:underline break-all">
                      {log.onChainTxHash.slice(0, 18)}… ↗
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="mt-2.5 text-[11px] text-t3">{expanded === log.id ? '▲ collapse' : '▼ expand details'}</div>
          </div>
        ))
      }
    </div>
  );
};

export default AgentLogs;
