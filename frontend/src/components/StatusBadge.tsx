type Status = 'pending'|'matched'|'discrepancy'|'paid'|'partial_paid'|'held'|'escalated'|
              'PAY'|'PARTIAL_PAY'|'HOLD'|'ESCALATE'|'PENDING'|'success'|'failed';

const CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:     { label: 'Pending',      bg: '#1A1A24', color: '#8888A0' },
  matched:     { label: 'Matched',      bg: '#0D3D30', color: '#00C2A8' },
  discrepancy: { label: 'Discrepancy',  bg: '#2A1F06', color: '#F59E0B' },
  paid:        { label: 'Settled',      bg: '#0D2A1A', color: '#22C55E' },
  partial_paid:{ label: 'Partial Paid', bg: '#2A1F06', color: '#F59E0B' },
  held:        { label: 'Held',         bg: '#2A0D0D', color: '#EF4444' },
  escalated:   { label: 'Escalated',    bg: '#2A0D0D', color: '#EF4444' },
  PAY:         { label: 'PAY',          bg: '#0D3D30', color: '#00C2A8' },
  PARTIAL_PAY: { label: 'PARTIAL PAY',  bg: '#2A1F06', color: '#F59E0B' },
  HOLD:        { label: 'HOLD',         bg: '#2A0D0D', color: '#EF4444' },
  ESCALATE:    { label: 'ESCALATE',     bg: '#2A0D0D', color: '#EF4444' },
  PENDING:     { label: 'Pending',      bg: '#1A1A24', color: '#8888A0' },
  success:     { label: 'Success',      bg: '#0D2A1A', color: '#22C55E' },
  failed:      { label: 'Failed',       bg: '#2A0D0D', color: '#EF4444' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const cfg = CONFIG[status] ?? CONFIG['pending'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em',
      background: cfg.bg, color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}
