import React, { useEffect, useState } from "react";
import { dashboardApi } from "../api";
import { Invoice, AgentLog, Settlement, DashboardSummary } from "../types";
import {
  MetricCard,
  Card,
  SectionHeader,
  DecisionBadge,
  StatusBadge,
  EmptyState,
  Spinner,
} from "../components/ui";

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentLogs, setRecentLogs] = useState<AgentLog[]>([]);
  const [recentSettlements, setRecentSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then((res) => {
        setSummary(res.data.summary);
        setRecentInvoices(res.data.recentInvoices ?? []);
        setRecentLogs(res.data.recentLogs ?? []);
        setRecentSettlements(res.data.recentSettlements ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          gap: 10,
        }}
      >
        <Spinner />
        <span style={{ color: "var(--text-3)" }}>Loading dashboard…</span>
      </div>
    );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 3 }}>
          Autonomous invoice settlement — powered by Arc & Circle
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 24,
            background: "var(--accent-dim)",
            border: "0.5px solid var(--accent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            <span
              style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}
            >
              Settlements execute autonomously — no wallet required
            </span>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>
              Circle Developer-Controlled Wallets · agent holds keys server-side
            </span>
          </div>
          <a
            href="https://testnet.arcscan.app/address/0x28c4c43bb4f3aed14901b90a7c8ef33354198ede"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--accent)",
            }}
          >
            0x28c4c43…198ede ↗
          </a>
        </div>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <MetricCard
          label="Total invoices"
          value={summary?.totalInvoices ?? 0}
        />
        <MetricCard
          label="Settled (USDC)"
          value={`$${(summary?.totalSettled ?? 0).toLocaleString()}`}
          accent
        />
        <MetricCard
          label="Pending"
          value={summary?.pending ?? 0}
          sub="Awaiting agent"
        />
        <MetricCard
          label="Held / Escalated"
          value={(summary?.held ?? 0) + (summary?.escalated ?? 0)}
          danger
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Recent invoices */}
        <Card>
          <SectionHeader title="Recent invoices" />
          {recentInvoices.length === 0 ?
            <EmptyState
              message="No invoices yet"
              sub="Submit an invoice to get started"
            />
          : recentInvoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom: "0.5px solid var(--border-dim)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {inv.invoiceNumber}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-3)",
                      marginTop: 2,
                    }}
                  >
                    {inv.supplierName}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-1)",
                    }}
                  >
                    ${inv.amount.toLocaleString()}
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              </div>
            ))
          }
        </Card>

        {/* Agent decisions */}
        <Card>
          <SectionHeader title="Agent decisions" />
          {recentLogs.length === 0 ?
            <EmptyState
              message="No agent decisions yet"
              sub="Process an invoice to see reasoning"
            />
          : recentLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "9px 0",
                  borderBottom: "0.5px solid var(--border-dim)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <DecisionBadge decision={log.decision} />
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ${log.amountToSettle.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-2)",
                    lineHeight: 1.5,
                  }}
                >
                  {log.reasoning.slice(0, 120)}
                  {log.reasoning.length > 120 ? "…" : ""}
                </div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Recent settlements */}
      <Card>
        <SectionHeader title="Recent settlements" />
        {recentSettlements.length === 0 ?
          <EmptyState
            message="No settlements yet"
            sub="Settled invoices will appear here with Arc transaction links"
          />
        : <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr>
                {[
                  "Supplier wallet",
                  "Amount (USDC)",
                  "Settled at",
                  "Arc TX",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "6px 10px",
                      color: "var(--text-3)",
                      fontWeight: 500,
                      fontSize: 11,
                      borderBottom: "0.5px solid var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSettlements.map((s) => (
                <tr key={s.id}>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-2)",
                    }}
                  >
                    {s.supplierWallet.slice(0, 10)}…{s.supplierWallet.slice(-6)}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    ${s.amountUsdc.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      color: "var(--text-3)",
                      fontSize: 12,
                    }}
                  >
                    {new Date(s.settledAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <a
                      href={`https://testnet.arcscan.app/tx/${s.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: "var(--accent)",
                      }}
                    >
                      {s.txHash.slice(0, 10)}…
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>
    </div>
  );
};

export default Dashboard;
