import React from "react";
import { AgentDecision, InvoiceStatus } from "../types";

// ── Card ──────────────────────────────────────────────────────────
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  className,
  ...props
}) => (
  <div
    {...props}
    className={className}
    style={{
      background: "var(--bg-card)",
      border: "0.5px solid var(--border)",
      borderRadius: 10,
      padding: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Button ────────────────────────────────────────────────────────
type BtnVariant = "primary" | "outline" | "ghost" | "danger";
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}> = ({ children, onClick, variant = "primary", disabled, loading, style }) => {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 16px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    border: "none",
    transition: "opacity 0.15s",
    fontFamily: "var(--font-sans)",
  };
  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "#003830" },
    outline: {
      background: "transparent",
      color: "var(--accent)",
      border: "0.5px solid var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-2)",
      border: "0.5px solid var(--border)",
    },
    danger: {
      background: "transparent",
      color: "var(--danger)",
      border: "0.5px solid var(--danger)",
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading ? "Processing…" : children}
    </button>
  );
};

// ── Decision Badge ────────────────────────────────────────────────
const decisionStyles: Record<
  AgentDecision,
  { bg: string; color: string; label: string }
> = {
  PAY: { bg: "var(--accent-dim)", color: "var(--accent)", label: "PAY" },
  PARTIAL_PAY: {
    bg: "var(--warning-dim)",
    color: "var(--warning)",
    label: "PARTIAL PAY",
  },
  HOLD: { bg: "var(--danger-dim)", color: "var(--danger)", label: "HOLD" },
  ESCALATE: {
    bg: "var(--bg-raised)",
    color: "var(--text-2)",
    label: "ESCALATE",
  },
  PENDING: { bg: "var(--bg-raised)", color: "var(--text-3)", label: "PENDING" },
};

export const DecisionBadge: React.FC<{ decision: AgentDecision }> = ({
  decision,
}) => {
  const s = decisionStyles[decision] ?? decisionStyles.PENDING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
};

// ── Invoice Status Badge ──────────────────────────────────────────
const statusStyles: Record<
  InvoiceStatus,
  { bg: string; color: string; label: string }
> = {
  pending: { bg: "var(--bg-raised)", color: "var(--text-3)", label: "Pending" },
  matched: {
    bg: "var(--accent-dim)",
    color: "var(--accent)",
    label: "Matched",
  },
  discrepancy: {
    bg: "var(--warning-dim)",
    color: "var(--warning)",
    label: "Discrepancy",
  },
  paid: { bg: "var(--success-dim)", color: "var(--success)", label: "Settled" },
  partial_paid: {
    bg: "var(--warning-dim)",
    color: "var(--warning)",
    label: "Partial",
  },
  held: { bg: "var(--danger-dim)", color: "var(--danger)", label: "Held" },
  escalated: {
    bg: "var(--bg-raised)",
    color: "var(--text-2)",
    label: "Escalated",
  },
};

export const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({
  status,
}) => {
  const s = statusStyles[status] ?? statusStyles.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
};

// ── Metric Card ───────────────────────────────────────────────────
export const MetricCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  danger?: boolean;
}> = ({ label, value, sub, accent, danger }) => (
  <Card>
    <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
      {label}
    </div>
    <div
      style={{
        fontSize: 24,
        fontWeight: 600,
        color:
          accent ? "var(--accent)"
          : danger ? "var(--danger)"
          : "var(--text-1)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
        {sub}
      </div>
    )}
  </Card>
);

// ── Section Header ────────────────────────────────────────────────
export const SectionHeader: React.FC<{
  title: string;
  action?: React.ReactNode;
}> = ({ title, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: "var(--text-3)",
        textTransform: "uppercase",
      }}
    >
      {title}
    </span>
    {action}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────
export const EmptyState: React.FC<{ message: string; sub?: string }> = ({
  message,
  sub,
}) => (
  <div
    style={{
      padding: "40px 20px",
      textAlign: "center",
      color: "var(--text-3)",
    }}
  >
    <div style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 4 }}>
      {message}
    </div>
    {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────
export const Spinner: React.FC = () => (
  <div
    style={{
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: "2px solid var(--border)",
      borderTopColor: "var(--accent)",
      animation: "spin 0.7s linear infinite",
      display: "inline-block",
    }}
  />
);
