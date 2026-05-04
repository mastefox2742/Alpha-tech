'use client';

import Header from '@/components/layout/Header';
import { StatsCard, SectionCard, Badge, ProgressBar } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import {
  formatCFA, formatDate, getTotalExpenses, getTotalRevenues,
  getNetBalance, getTotalTicketsSold, getProgressPercent, daysUntilEvent
} from '@/lib/utils';
import Link from 'next/link';

export default function ClientDashboard() {
  const { state } = useApp();
  const { meetings, expenses, ticketSales, revenues, teamMembers, currentUser } = state;

  const totalRevenue = getTotalRevenues(ticketSales, revenues);
  const totalExpenses = getTotalExpenses(expenses);
  const netBalance = getNetBalance(ticketSales, revenues, expenses);
  const ticketsSold = getTotalTicketsSold(ticketSales);
  const ticketPercent = getProgressPercent(ticketsSold, state.ticketTarget);
  const budgetPercent = getProgressPercent(totalExpenses, state.budgetTotal);
  const days = daysUntilEvent(state.eventDate);

  const nextMeeting = meetings.find(m => m.status === 'scheduled');
  const pendingActions = meetings.flatMap(m => m.actions).filter(a => !a.completed);
  const completedActions = meetings.flatMap(m => m.actions).filter(a => a.completed);

  const currentTeamMember = teamMembers.find(m => m.id === currentUser?.id);

  const unreadAlerts = state.alerts.filter(a => !a.read);

  return (
    <div className="animate-fade-in">
      <Header
        role="client"
        title="Dashboard"
        subtitle={state.eventName}
      />

      <div className="p-6 space-y-6">

        {/* Alerts & Errors Section */}
        {unreadAlerts.length > 0 && (
          <SectionCard title={`🚨 Alertes et Erreurs (${unreadAlerts.length})`}>
            <div className="divide-y divide-border">
              {unreadAlerts.map(alert => (
                <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 ${alert.severity === 'error' ? 'bg-danger/5' : 'bg-gold/5'}`}>
                  <div className="text-xl flex-shrink-0 mt-0.5">
                    {alert.severity === 'error' ? '❌' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${alert.severity === 'error' ? 'text-danger' : 'text-gold'}`}>
                      {alert.severity === 'error' ? 'Erreur Système' : 'Alerte'}
                    </p>
                    <p className="text-sm text-ink">{alert.message}</p>
                    <p className="text-xs text-muted mt-1">{formatDate(alert.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Mes Tâches - Personalized view */}
        {currentTeamMember && currentTeamMember.tasks && currentTeamMember.tasks.length > 0 && (
          <SectionCard
            title={`👋 Bonjour ${currentTeamMember.name.split(' ')[0]} — Tes tâches assignées`}
            subtitle={`${currentTeamMember.tasks.length} tâches à faire`}
          >
            <div className="divide-y divide-border">
              {currentTeamMember.tasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-3 px-4 py-3 hover-card hover:bg-surface transition-colors cursor-pointer group">
                  <div className="w-5 h-5 rounded-full border border-border mt-0.5 flex-shrink-0 group-hover:border-accent transition-colors flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink leading-snug">{task}</p>
                    <p className="text-xs text-muted mt-0.5">Pour {state.eventName}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Revenus totaux"
            value={formatCFA(totalRevenue)}
            icon="💰"
            color="success"
            sub="Billets + sponsors"
          />
          <StatsCard
            label="Dépenses"
            value={formatCFA(totalExpenses)}
            icon="💸"
            color="danger"
            sub={`${budgetPercent}% du budget`}
          />
          <StatsCard
            label="Solde net"
            value={formatCFA(netBalance)}
            icon="⚖️"
            color={netBalance >= 0 ? 'highlight' : 'danger'}
          />
          <StatsCard
            label="Jours restants"
            value={`J-${days}`}
            icon="⏳"
            color={days <= 30 ? 'gold' : 'accent'}
            sub={formatDate(state.eventDate)}
          />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Tickets */}
          <SectionCard
            title="🎟 Billets vendus"
            subtitle={`${ticketsSold} / ${state.ticketTarget} billets`}
            action={
              <Link href="/client/billets" className="text-xs text-accent hover:underline">Voir →</Link>
            }
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-accent">{ticketsSold}</span>
                <Badge color={ticketPercent >= 80 ? 'success' : ticketPercent >= 50 ? 'gold' : 'muted'}>
                  {ticketPercent}%
                </Badge>
              </div>
              <ProgressBar percent={ticketPercent} color="#1C92FF" />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {['VIP', 'Standard', 'Gratuit'].map(type => {
                  const count = ticketSales
                    .filter(t => t.type === type)
                    .reduce((s, t) => s + t.quantity, 0);
                  return (
                    <div key={type} className="bg-surface rounded-lg p-2">
                      <div className="font-bold text-sm text-ink">{count}</div>
                      <div className="text-xs text-muted">{type}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* Budget */}
          <SectionCard
            title="💰 Budget"
            subtitle={`${formatCFA(totalExpenses)} dépensés`}
            action={
              <Link href="/client/finances" className="text-xs text-accent hover:underline">Voir →</Link>
            }
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-danger">{formatCFA(totalExpenses)}</span>
                <Badge color={budgetPercent >= 90 ? 'danger' : budgetPercent >= 70 ? 'gold' : 'success'}>
                  {budgetPercent}% utilisé
                </Badge>
              </div>
              <ProgressBar
                percent={budgetPercent}
                color={budgetPercent >= 90 ? '#f04e4e' : budgetPercent >= 70 ? '#f5a623' : '#22c58b'}
              />
              <div className="mt-2 text-xs text-muted">
                Reste : <span className="text-ink font-semibold">{formatCFA(state.budgetTotal - totalExpenses)}</span> sur {formatCFA(state.budgetTotal)}
              </div>
            </div>
          </SectionCard>

          {/* Actions à suivre */}
          <SectionCard
            title="✅ Actions de l'équipe"
            subtitle={`${pendingActions.length} en attente`}
          >
            <div className="divide-y divide-border">
              {pendingActions.slice(0, 4).map(a => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-4 h-4 rounded border border-border mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-ink leading-snug truncate">{a.description}</p>
                    <p className="text-xs text-muted mt-0.5">{a.assignedTo} · {formatDate(a.dueDate)}</p>
                  </div>
                </div>
              ))}
              {pendingActions.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted">✨ Toutes les actions sont complétées</div>
              )}
            </div>
            {pendingActions.length > 4 && (
              <div className="px-4 py-2 text-xs text-muted text-center border-t border-border">
                +{pendingActions.length - 4} autres actions
              </div>
            )}
          </SectionCard>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Prochaine réunion */}
          <SectionCard
            title="📅 Prochaine réunion"
            action={<Link href="/client/planning" className="text-xs text-accent hover:underline">Voir →</Link>}
          >
            {nextMeeting ? (
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center text-xl flex-shrink-0">
                     📋
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink">{nextMeeting.title}</p>
                    <p className="text-xs text-muted mt-1">
                      {formatDate(nextMeeting.date)} à {nextMeeting.time}
                    </p>
                    <p className="text-xs text-muted">{nextMeeting.location}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {nextMeeting.participants.slice(0, 3).map(p => (
                        <span key={p} className="text-xs bg-surface px-2 py-0.5 rounded text-muted">{p}</span>
                      ))}
                      {nextMeeting.participants.length > 3 && (
                        <span className="text-xs bg-surface px-2 py-0.5 rounded text-muted">
                          +{nextMeeting.participants.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-muted">Aucune réunion planifiée</div>
            )}
          </SectionCard>

          {/* Équipe */}
          <SectionCard
            title="👥 Statut de l'équipe"
            action={<Link href="/client/equipe" className="text-xs text-accent hover:underline">Voir →</Link>}
          >
            <div className="divide-y divide-border">
              {teamMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.isOnline ? 'bg-success' : 'bg-border'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{m.name}</p>
                    <p className="text-xs text-muted truncate">{m.role}</p>
                  </div>
                  <Badge color={m.slidesReady ? 'success' : 'muted'}>
                    {m.slidesReady ? '✓ Prêt' : 'En cours'}
                  </Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

      </div>
    </div>
  );
}
