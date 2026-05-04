'use client';

import Header from '@/components/layout/Header';
import { Button, StatsCard } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import {
  formatCFA, formatDate, getTotalRevenues, getTotalExpenses,
  getNetBalance, getTotalTicketsSold, getProgressPercent
} from '@/lib/utils';

export default function RapportsPage() {
  const { state } = useApp();
  const { meetings, expenses, ticketSales, revenues, teamMembers } = state;

  const totalRevenue  = getTotalRevenues(ticketSales, revenues);
  const totalExpenses = getTotalExpenses(expenses);
  const net           = getNetBalance(ticketSales, revenues, expenses);
  const ticketsSold   = getTotalTicketsSold(ticketSales);
  const ticketPct     = getProgressPercent(ticketsSold, state.ticketTarget);
  const pendingActions = meetings.flatMap(m => m.actions).filter(a => !a.completed);
  const slidesReady    = teamMembers.filter(m => m.slidesReady).length;

  function printReport() { window.print(); }

  return (
    <div className="animate-fade-in">
      <Header
        role="client"
        title="Rapports"
        subtitle="Synthèse complète"
        action={<Button onClick={printReport} variant="secondary" size="sm" icon="🖨️">Imprimer</Button>}
      />
      <div className="p-6 space-y-6">

        {/* Report header */}
        <div className="bg-gradient-to-r from-accent/10 via-card to-highlight/8 border border-accent/20 rounded-xl p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-accent mb-2">Rapport de synthèse</div>
          <h2 className="text-2xl font-bold text-ink mb-1">{state.eventName}</h2>
          <p className="text-muted text-sm">Généré le {formatDate(new Date().toISOString())} · {formatDate(state.eventDate)}</p>
        </div>

        {/* Finances */}
        <section>
          <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><span>💰</span> Finances</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard label="Revenus"        value={formatCFA(totalRevenue)}  color="success" />
            <StatsCard label="Dépenses"       value={formatCFA(totalExpenses)} color="danger" />
            <StatsCard label="Solde net"      value={formatCFA(net)}           color={net >= 0 ? 'highlight' : 'danger'} />
            <StatsCard label="Budget restant" value={formatCFA(Math.max(0, state.budgetTotal - totalExpenses))} color="accent" />
          </div>
        </section>

        {/* Billets */}
        <section>
          <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><span>🎟</span> Billets</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatsCard label="Vendus"     value={String(ticketsSold)}    color="accent" sub={`/${state.ticketTarget}`} />
            <StatsCard label="Objectif %"  value={`${ticketPct}%`}       color={ticketPct >= 80 ? 'success' : 'gold'} />
            <StatsCard label="Revenus billets" value={formatCFA(ticketSales.reduce((s,t) => s+t.total, 0))} color="success" />
          </div>
        </section>

        {/* Réunions */}
        <section>
          <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><span>📋</span> Réunions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard label="Total réunions"  value={String(meetings.length)}                                     color="accent" />
            <StatsCard label="Terminées"       value={String(meetings.filter(m => m.status === 'completed').length)} color="success" />
            <StatsCard label="Actions pending" value={String(pendingActions.length)}                                color={pendingActions.length > 5 ? 'danger' : 'gold'} />
            <StatsCard label="Actions closes"  value={String(meetings.flatMap(m=>m.actions).filter(a=>a.completed).length)} color="highlight" />
          </div>
        </section>

        {/* Équipe */}
        <section>
          <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><span>👥</span> Équipe</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatsCard label="Membres"         value={String(teamMembers.length)} color="accent" />
            <StatsCard label="Slides prêtes"   value={`${slidesReady}/${teamMembers.length}`} color={slidesReady === teamMembers.length ? 'success' : 'gold'} />
            <StatsCard label="En ligne"        value={String(teamMembers.filter(m => m.isOnline).length)} color="highlight" />
          </div>
        </section>

        {/* Actions pending detail */}
        {pendingActions.length > 0 && (
          <section>
            <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><span>⚠️</span> Actions en attente</h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="data-table">
                <thead><tr><th>Action</th><th>Assignée à</th><th>Échéance</th></tr></thead>
                <tbody>
                  {pendingActions.map(a => (
                    <tr key={a.id}>
                      <td>{a.description}</td>
                      <td>{a.assignedTo}</td>
                      <td className="font-mono text-xs">{formatDate(a.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
