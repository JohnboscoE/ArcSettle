import React, { useEffect, useState } from 'react';
import { agentApi } from '../api';
import { AgentLog } from '../types';
import { Card, DecisionBadge, SectionHeader, EmptyState, Spinner } from '../components/ui';

const severityColor = { low: 'var(--accent)', medium: 'var(--warning)', high: 'var(--danger)' };

const AgentLogs: React.FC = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    agentApi.getLogs().then(res => setLogs(res.data.logs ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 40, color: 'var(--text-3)' }}>
      <Spinner /> Loading agent logs…
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Agent logs</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>
          Every decision the agent makes is logged here with full reasoning — stored on Arc as an immutable audit trail
        </p>
      </div>

      {logs.length === 0
        ? <Card><EmptyState message="No agent decisions yet" sub="Process an invoice to see the agent's reasoning" /></Card>
        : [...logs].reverse().map(log => (
          <Card key={log.id} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <DecisionBadge decision={log.decision} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    Invoice: {log.invoiceId.slice(0, 8)}… · PO: {log.poId ?? 'none'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  ${log.amountToSettle.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                  {log.discrepancies.length} discrepanc{log.discrepancies.length === 1 ? 'y' : 'ies'}
                </div>
              </div>
            </div>

            {/* Reasoning — always visible */}
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: 'var(--bg-raised)', borderRadius: 6,
              fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6,
              borderLeft: '2px solid var(--accent)',
            }}>
              {log.reasoning}
            </div>

            {/* Expanded details */}
            {expanded === log.id && (
              <div style={{ marginTop: 12 }}>
                {log.discrepancies.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <SectionHeader title="Discrepancies detected" />
                    {log.discrepancies.map((d, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '7px 0', borderBottom: '0.5px solid var(--border-dim)',
                        fontSize: 12,
                      }}>
                        <div>
                          <span style={{ color: severityColor[d.severity], fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>
                            {d.severity}
                          </span>
                          <span style={{ color: 'var(--text-2)', marginLeft: 8 }}>{d.field}</span>
                          <div style={{ color: 'var(--text-3)', marginTop: 2 }}>{d.note}</div>
                        </div>
                        <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
                          <div>Invoice: {d.invoiceValue}</div>
                          <div style={{ color: 'var(--text-3)' }}>PO: {d.poValue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {log.onChainTxHash && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>On-chain tx:</span>
                    <a
                      href={`https://testnet.arcscan.app/tx/${log.onChainTxHash}`}
                      target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
                    >
                      {log.onChainTxHash.slice(0, 18)}… ↗
                    </a>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
              {expanded === log.id ? '▲ collapse' : '▼ expand details'}
            </div>
          </Card>
        ))
      }
    </div>
  );
};

export default AgentLogs;
