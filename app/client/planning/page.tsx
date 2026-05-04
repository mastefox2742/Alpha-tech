'use client';

import Header from '@/components/layout/Header';
import { SectionCard, Badge, EmptyState, StatsCard } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { formatDate, formatCFA, getTotalRevenues, getTotalExpenses, getNetBalance, getTotalTicketsSold } from '@/lib/utils';

export default function PlanningPage() {
  const { state } = useApp();
  const meetings = [...state.meetings].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="animate-fade-in">
      <Header role="client" title="Planning" subtitle="Calendrier et échéances" />
      <div className="p-6 space-y-6">

        {/* Event countdown */}
        <div className="bg-gradient-to-r from-accent/10 to-highlight/8 border border-accent/20 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎯</div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-accent mb-1">Événement principal</div>
              <div className="font-bold text-xl text-ink">{state.eventName}</div>
              <div className="text-sm text-muted mt-1">{formatDate(state.eventDate)}</div>
            </div>
          </div>
        </div>

        {/* Deadlines */}
        <SectionCard title="⏰ Deadlines importantes">
          <div className="divide-y divide-border">
            {[
              { date: 'J-21', label: 'Slides de chacun prêtes et partagées', who: 'Toute l\'équipe', done: false },
              { date: 'J-14', label: 'Répétition générale en visio (chronométrée)', who: 'Toute l\'équipe', done: false },
              { date: 'J-7',  label: 'Test technique complet (connexion, vidéoprojecteur)', who: 'Dev + Secrétaire', done: false },
              { date: 'J-3',  label: 'Communication finale : rappel participants', who: 'BizDev 1', done: false },
              { date: 'J-1',  label: 'Test Zoom/Teams avec Italie', who: 'Leader + Secrétaire', done: false },
              { date: 'J',    label: 'Arriver 1h30 à l\'avance', who: 'Équipe sur place', done: false },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="w-10 text-center">
                  <span className="text-xs font-mono font-bold text-accent">{d.date}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ink">{d.label}</p>
                  <p className="text-xs text-muted">{d.who}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Meetings list */}
        <SectionCard title="📋 Toutes les réunions" subtitle={`${meetings.length} réunion(s) total`}>
          {meetings.length === 0 ? (
            <EmptyState icon="📅" message="Aucune réunion" sub="La secrétaire peut en planifier depuis son espace" />
          ) : (
            <div className="divide-y divide-border">
              {meetings.map(m => (
                <div key={m.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/12 flex items-center justify-center text-lg flex-shrink-0">
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{m.title}</p>
                    <p className="text-xs text-muted">{formatDate(m.date)} à {m.time} · {m.location}</p>
                  </div>
                  <Badge color={m.status === 'completed' ? 'success' : m.status === 'scheduled' ? 'accent' : 'gold'}>
                    {m.status === 'completed' ? 'Terminée' : m.status === 'scheduled' ? 'Planifiée' : 'En cours'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
