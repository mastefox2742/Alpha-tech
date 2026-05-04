// ─── BILLETS PAGE ─────────────────────────────────────────────────────────────
// app/client/billets/page.tsx
'use client';

import Header from '@/components/layout/Header';
import { StatsCard, SectionCard, Badge, ProgressBar } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import {
  formatCFA, formatDateShort, getTotalTicketsSold,
  getTotalTicketRevenue, getProgressPercent, ticketColors
} from '@/lib/utils';

export default function BilletsPage() {
  const { state } = useApp();
  const { ticketSales, revenues } = state;

  const totalSold = getTotalTicketsSold(ticketSales);
  const totalRev  = getTotalTicketRevenue(ticketSales);
  const pct       = getProgressPercent(totalSold, state.ticketTarget);

  const byType = ['VIP', 'Standard', 'Gratuit'].map(type => ({
    type,
    count: ticketSales.filter(t => t.type === type).reduce((s, t) => s + t.quantity, 0),
    revenue: ticketSales.filter(t => t.type === type).reduce((s, t) => s + t.total, 0),
  }));

  return (
    <div className="animate-fade-in">
      <Header role="client" title="Billets & Revenus" subtitle={`Objectif : ${state.ticketTarget} billets`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Billets vendus"    value={String(totalSold)}    icon="🎟"  color="accent" sub={`/${state.ticketTarget} objectif`} />
          <StatsCard label="Revenus billets"   value={formatCFA(totalRev)}  icon="💰"  color="success" />
          <StatsCard label="Progression"       value={`${pct}%`}           icon="📊"  color={pct >= 80 ? 'success' : 'gold'} />
          <StatsCard label="Ventes à faire"    value={String(Math.max(0, state.ticketTarget - totalSold))} icon="🎯" color="info" />
        </div>

        {/* Progress */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm">Progression vers l&apos;objectif</span>
            <Badge color={pct >= 80 ? 'success' : pct >= 50 ? 'gold' : 'muted'}>{pct}%</Badge>
          </div>
          <ProgressBar percent={pct} color="#1C92FF" />
          <div className="flex justify-between mt-2 text-xs text-muted">
            <span>{totalSold} vendus</span>
            <span>{state.ticketTarget} objectif</span>
          </div>
        </div>

        {/* By type */}
        <div className="grid grid-cols-3 gap-4">
          {byType.map(({ type, count, revenue }) => (
            <div key={type} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: ticketColors[type] }}>{count}</div>
              <div className="text-sm font-semibold text-ink mb-1">{type}</div>
              <div className="text-xs text-muted">{formatCFA(revenue)}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <SectionCard title="📋 Historique des ventes">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th><th>Quantité</th><th>Prix unit.</th><th>Canal</th><th>Date</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ticketSales.map(t => (
                  <tr key={t.id}>
                    <td><Badge color={t.type === 'VIP' ? 'gold' : t.type === 'Standard' ? 'accent' : 'muted'}>{t.type}</Badge></td>
                    <td>{t.quantity}</td>
                    <td>{formatCFA(t.unitPrice)}</td>
                    <td>{t.channel}</td>
                    <td className="font-mono text-xs">{formatDateShort(t.date)}</td>
                    <td className="font-bold text-success">{formatCFA(t.total)}</td>
                  </tr>
                ))}
                {ticketSales.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted">Aucune vente enregistrée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
