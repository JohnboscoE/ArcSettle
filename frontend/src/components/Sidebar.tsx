import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',   icon: '▦' },
  { to: '/invoices',    label: 'Invoices',    icon: '◈' },
  { to: '/pos',         label: 'PO Register', icon: '◉' },
  { to: '/settlements', label: 'Settlements', icon: '◎' },
  { to: '/agent',       label: 'Agent Logs',  icon: '❖' },
];

// Bottom nav for mobile
const BottomNav: React.FC = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex md:hidden">
    {NAV.map(({ to, label, icon }) => (
      <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-t3'}`
      }>
        <span className="text-base leading-none">{icon}</span>
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

// Sidebar for desktop
const DesktopSidebar: React.FC = () => (
  <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-56 bg-card border-r border-border flex-col z-50">
    {/* Logo */}
    <div className="px-5 py-6 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-sm font-bold text-[#003830]">A</div>
        <div>
          <div className="text-sm font-semibold text-t1">ArcSettle</div>
          <div className="text-[9px] text-t3 tracking-wider">ARC · CIRCLE · USDC</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 p-2.5">
      {NAV.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all ${
            isActive ? 'bg-accent-dim text-accent' : 'text-t2 hover:text-t1 hover:bg-raised'
          }`
        }>
          <span className="text-xs opacity-70">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>

    {/* Agent status */}
    <div className="px-5 py-4 border-t border-border">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-success" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
        <span className="text-[11px] text-t3">Agent live on Arc</span>
      </div>
    </div>
  </aside>
);

const Sidebar: React.FC = () => (
  <>
    <DesktopSidebar />
    <BottomNav />
  </>
);

export default Sidebar;
