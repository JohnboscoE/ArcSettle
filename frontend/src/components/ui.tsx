import React from 'react';
import { AgentDecision, InvoiceStatus } from '../types';

// ── Card ──────────────────────────────────────────────────────────
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-card border border-border rounded-xl p-4 md:p-5 ${className}`}>
    {children}
  </div>
);

// ── Button ────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}> = ({ children, onClick, variant = 'primary', disabled, loading, className = '' }) => {
  const base = 'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-accent text-[#003830]',
    outline: 'bg-transparent text-accent border border-accent',
    ghost:   'bg-transparent text-t2 border border-border',
    danger:  'bg-transparent text-danger border border-danger',
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
      {loading ? 'Processing…' : children}
    </button>
  );
};

// ── Decision Badge ────────────────────────────────────────────────
const decisionStyles: Record<AgentDecision, string> = {
  PAY:         'bg-accent-dim text-accent',
  PARTIAL_PAY: 'bg-warning-dim text-warning',
  HOLD:        'bg-danger-dim text-danger',
  ESCALATE:    'bg-raised text-t2',
  PENDING:     'bg-raised text-t3',
};
const decisionLabels: Record<AgentDecision, string> = {
  PAY: 'PAY', PARTIAL_PAY: 'PARTIAL PAY', HOLD: 'HOLD', ESCALATE: 'ESCALATE', PENDING: 'PENDING',
};

export const DecisionBadge: React.FC<{ decision: AgentDecision }> = ({ decision }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide ${decisionStyles[decision] ?? decisionStyles.PENDING}`}>
    {decisionLabels[decision] ?? decision}
  </span>
);

// ── Status Badge ──────────────────────────────────────────────────
const statusStyles: Record<InvoiceStatus, string> = {
  pending:     'bg-raised text-t3',
  matched:     'bg-accent-dim text-accent',
  discrepancy: 'bg-warning-dim text-warning',
  paid:        'bg-success-dim text-success',
  partial_paid:'bg-warning-dim text-warning',
  held:        'bg-danger-dim text-danger',
  escalated:   'bg-raised text-t2',
};
const statusLabels: Record<InvoiceStatus, string> = {
  pending: 'Pending', matched: 'Matched', discrepancy: 'Discrepancy',
  paid: 'Settled', partial_paid: 'Partial', held: 'Held', escalated: 'Escalated',
};

export const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide ${statusStyles[status] ?? statusStyles.pending}`}>
    {statusLabels[status] ?? status}
  </span>
);

// ── Metric Card ───────────────────────────────────────────────────
export const MetricCard: React.FC<{
  label: string; value: string | number; sub?: string;
  accent?: boolean; danger?: boolean;
}> = ({ label, value, sub, accent, danger }) => (
  <Card>
    <div className="text-xs text-t2 mb-1.5">{label}</div>
    <div className={`text-2xl font-semibold font-mono ${accent ? 'text-accent' : danger ? 'text-danger' : 'text-t1'}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-t3 mt-1">{sub}</div>}
  </Card>
);

// ── Section Header ────────────────────────────────────────────────
export const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-3">
    <span className="text-[11px] font-semibold tracking-widest text-t3 uppercase">{title}</span>
    {action}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────
export const EmptyState: React.FC<{ message: string; sub?: string }> = ({ message, sub }) => (
  <div className="py-10 px-4 text-center">
    <div className="text-sm text-t2 mb-1">{message}</div>
    {sub && <div className="text-xs text-t3">{sub}</div>}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────
export const Spinner: React.FC = () => (
  <div className="w-4 h-4 rounded-full border-2 border-border border-t-accent inline-block" style={{ animation: 'spin 0.7s linear infinite' }} />
);

// ── Page Header ───────────────────────────────────────────────────
export const PageHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-start justify-between mb-6 gap-4">
    <div>
      <h1 className="text-xl font-semibold text-t1">{title}</h1>
      {sub && <p className="text-sm text-t3 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ── Mobile Card Row (replaces table rows on small screens) ────────
export const MobileRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-card border border-border rounded-xl p-4 mb-3 ${className}`}>
    {children}
  </div>
);
