'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { StatsCard, SectionCard, Button } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { formatCFA, getTotalExpenses, getTotalRevenues, getTotalTicketsSold, formatDate } from '@/lib/utils';
import { AlertSeverity } from '@/lib/types';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StaffDashboard() {
  const { state, dispatch } = useApp();
  const { meetings, expenses, ticketSales, revenues } = state;

  const totalExpenses = getTotalExpenses(expenses);
  const totalRevenues = getTotalRevenues(ticketSales, revenues);
  const ticketsSold   = getTotalTicketsSold(ticketSales);
  const nextMeeting   = meetings.find(m => m.status === 'scheduled');
  const pendingActions = meetings.flatMap(m => m.actions).filter(a => !a.completed);
  const unreadAlerts = state.alerts.filter(a => !a.read);

  const [dateForm, setDateForm] = useState(state.eventDate);
  const [budgetForm, setBudgetForm] = useState(state.budgetTotal.toString());
  const [ticketTargetForm, setTicketTargetForm] = useState(state.ticketTarget.toString());
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>('info');

  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateForm) dispatch({ type: 'UPDATE_EVENT_DATE', payload: dateForm });
    dispatch({ type: 'UPDATE_BUDGET_TOTAL', payload: parseInt(budgetForm) || 0 });
    dispatch({ type: 'UPDATE_TICKET_TARGET', payload: parseInt(ticketTargetForm) || 0 });
    toast.success("Configuration de l'événement mise à jour !");
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertMessage.trim()) {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          id: Date.now().toString(),
          message: alertMessage,
          severity: alertSeverity,
          date: new Date().toISOString(),
          read: false,
        }
      });
      setAlertMessage('');
      toast.success("Notification d'alerte envoyée au client !");
    }
  };

  return (
    <div className="animate-fade-in">
      <Header role="staff" title="Mon espace" subtitle="Bonjour — Que fait-on aujourd'hui ?" />
      <div className="p-6 space-y-6">

        {/* Panneau de Contrôle Secrétaire */}
        <SectionCard title="🎛️ Panneau de Contrôle">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timer / Event Date / Counters */}
            <div>
              <h3 className="text-sm font-semibold text-ink mb-4">Configuration Générale</h3>
              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <div>
                  <label className="text-xs text-muted block mb-1">Date de l&apos;événement</label>
                  <input
                    type="date"
                    value={dateForm}
                    onChange={e => setDateForm(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-highlight/50 focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted block mb-1">Budget Total (FCFA)</label>
                    <input
                      type="number"
                      value={budgetForm}
                      onChange={e => setBudgetForm(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-highlight/50 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Objectif Billets</label>
                    <input
                      type="number"
                      value={ticketTargetForm}
                      onChange={e => setTicketTargetForm(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-highlight/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="highlight" size="sm" className="w-full justify-center">Mettre à jour la config</Button>
              </form>
            </div>

            {/* Notification / Alert */}
            <div>
              <h3 className="text-sm font-semibold text-ink mb-2">Envoyer une notification au client</h3>
              <form onSubmit={handleSendAlert} className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={alertSeverity}
                    onChange={e => setAlertSeverity(e.target.value as AlertSeverity)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-highlight/50 focus:outline-none"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Attention</option>
                    <option value="error">Erreur</option>
                  </select>
                  <input
                    type="text"
                    value={alertMessage}
                    onChange={e => setAlertMessage(e.target.value)}
                    placeholder="Message d'alerte..."
                    className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink focus:border-highlight/50 focus:outline-none"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" className="w-full justify-center">Envoyer la notification</Button>
              </form>
            </div>
          </div>
        </SectionCard>

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

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/staff/notes">
            <div className="bg-card border border-highlight/20 rounded-xl p-4 hover:bg-highlight/5 hover:border-highlight/40 transition-all cursor-pointer text-center">
              <div className="text-3xl mb-2">✍️</div>
              <div className="text-xs font-semibold text-highlight">Nouvelle note</div>
              <div className="text-xs text-muted mt-0.5">Réunion en cours</div>
            </div>
          </Link>
          <Link href="/staff/depenses">
            <div className="bg-card border border-danger/20 rounded-xl p-4 hover:bg-danger/5 hover:border-danger/40 transition-all cursor-pointer text-center">
              <div className="text-3xl mb-2">💸</div>
              <div className="text-xs font-semibold text-danger">Dépense</div>
              <div className="text-xs text-muted mt-0.5">Enregistrer</div>
            </div>
          </Link>
          <Link href="/staff/billets">
            <div className="bg-card border border-accent/20 rounded-xl p-4 hover:bg-accent/5 hover:border-accent/40 transition-all cursor-pointer text-center">
              <div className="text-3xl mb-2">🎟</div>
              <div className="text-xs font-semibold text-accent">Billet vendu</div>
              <div className="text-xs text-muted mt-0.5">Saisir vente</div>
            </div>
          </Link>
          <Link href="/staff/planning">
            <div className="bg-card border border-gold/20 rounded-xl p-4 hover:bg-gold/5 hover:border-gold/40 transition-all cursor-pointer text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-xs font-semibold text-gold">Planifier</div>
              <div className="text-xs text-muted mt-0.5">Nouvelle réunion</div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Dépenses saisies" value={String(expenses.length)}   icon="💸"  color="danger"  />
          <StatsCard label="Revenus"           value={formatCFA(totalRevenues)}  icon="💰"  color="success" />
          <StatsCard label="Billets vendus"    value={String(ticketsSold)}       icon="🎟"  color="accent"  />
          <StatsCard label="Actions en attente" value={String(pendingActions.length)} icon="⚠️" color={pendingActions.length > 3 ? 'danger' : 'gold'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Prochaine réunion */}
          <SectionCard
            title="📅 Prochaine réunion"
            action={<Link href="/staff/planning" className="text-xs text-highlight hover:underline">Planifier →</Link>}
          >
            {nextMeeting ? (
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-highlight/12 flex items-center justify-center text-xl flex-shrink-0">📋</div>
                  <div>
                    <p className="font-semibold text-sm text-ink">{nextMeeting.title}</p>
                    <p className="text-xs text-muted mt-1">{formatDate(nextMeeting.date)} à {nextMeeting.time}</p>
                    <p className="text-xs text-muted">{nextMeeting.location}</p>
                  </div>
                </div>
                <Link href="/staff/notes">
                  <Button variant="highlight" size="sm" className="mt-4 w-full justify-center" icon="✍️">
                    Démarrer la prise de notes
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-muted mb-3">Aucune réunion planifiée</p>
                <Link href="/staff/planning">
                  <Button variant="highlight" size="sm" icon="📅">Planifier une réunion</Button>
                </Link>
              </div>
            )}
          </SectionCard>

          {/* AI Assistant teaser */}
          <SectionCard
            title="🤖 Assistant IA"
            action={<Link href="/staff/assistant" className="text-xs text-highlight hover:underline">Ouvrir →</Link>}
          >
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {[
                  '"Résume les notes de la dernière réunion"',
                  '"Génère l\'ordre du jour de samedi"',
                  '"Quelles dépenses restent à valider ?"',
                  '"Rédige un email de convocation"',
                ].map((q, i) => (
                  <div key={i} className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-muted italic">
                    {q}
                  </div>
                ))}
              </div>
              <Link href="/staff/assistant">
                <Button variant="highlight" size="sm" className="w-full justify-center" icon="🤖">
                  Ouvrir l&apos;assistant
                </Button>
              </Link>
            </div>
          </SectionCard>
        </div>

        {/* Recent actions */}
        {pendingActions.length > 0 && (
          <SectionCard title="⚠️ Actions en attente de votre suivi">
            <div className="divide-y divide-border">
              {pendingActions.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{a.description}</p>
                    <p className="text-xs text-muted">{a.assignedTo} · {formatDate(a.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
