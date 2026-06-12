import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/',            label: 'Dashboard',   icon: '▦' },
  { to: '/invoices',    label: 'Invoices',    icon: '◈' },
  { to: '/pos',         label: 'PO Register', icon: '◉' },
  { to: '/settlements', label: 'Settlements', icon: '◎' },
  { to: '/agent',       label: 'Agent Logs',  icon: '◈' },
];

const Sidebar: React.FC = () => (
  <aside style={{
    width: 220, minHeight: '100vh', background: 'var(--bg-card)',
    borderRight: '0.5px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
  }}>
    {/* Logo */}
    <div style={{ padding: '24px 20px 20px', borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, background: 'var(--accent)',
          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#003830',
        }}>A</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>ArcSettle</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em' }}>POWERED BY ARC · CIRCLE</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: '12px 10px' }}>
      {NAV.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 6, marginBottom: 2,
          fontSize: 13, fontWeight: isActive ? 500 : 400,
          color: isActive ? 'var(--accent)' : 'var(--text-2)',
          background: isActive ? 'var(--accent-dim)' : 'transparent',
          textDecoration: 'none', transition: 'all 0.15s',
        })}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>

    {/* Agent status */}
    <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Agent registered on Arc</span>
      </div>
    </div>
  </aside>
);

export default Sidebar;
