'use client';

import Header from '@/components/layout/Header';
import { SectionCard, Badge, EmptyState } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/utils';

const statusColors: Record<string, 'accent' | 'success' | 'gold' | 'muted'> = {
  scheduled:   'accent',
  'in-progress': 'gold',
  completed:   'success',
  cancelled:   'muted',
};

const statusLabels: Record<string, string> = {
  scheduled:    'Planifiée',
  'in-progress': 'En cours',
  completed:    'Terminée',
  cancelled:    'Annulée',
};

export default function ReunionsPage() {
  const { state, dispatch } = useApp();
  const { meetings } = state;

  const completed  = meetings.filter(m => m.status === 'completed');
  const upcoming   = meetings.filter(m => m.status !== 'completed' && m.status !== 'cancelled');

  return (
    <div className="animate-fade-in">
      <Header role="client" title="Réunions" subtitle="Historique et comptes rendus" />
      <div className="p-6 space-y-6">

        {/* À venir */}
        <SectionCard title="📅 Réunions planifiées" subtitle={`${upcoming.length} réunion(s)`}>
          {upcoming.length === 0 ? (
            <EmptyState icon="📅" message="Aucune réunion planifiée" sub="Demandez à la secrétaire d'en créer une" />
          ) : (
            <div className="divide-y divide-border">
              {upcoming.map(m => (
                <div key={m.id} className="p-4 hover:bg-surface/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-ink">{m.title}</h3>
                      <p className="text-xs text-muted mt-1">
                        {formatDate(m.date)} à {m.time} · {m.location}
                      </p>
                    </div>
                    <Badge color={statusColors[m.status]}>{statusLabels[m.status]}</Badge>
                  </div>
                  {m.agenda.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-muted mb-1">Ordre du jour</p>
                      <ul className="space-y-0.5">
                        {m.agenda.map((item, i) => (
                          <li key={i} className="text-xs text-muted pl-3 border-l border-border">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.participants.map(p => (
                      <span key={p} className="text-xs bg-surface px-2 py-0.5 rounded text-muted">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Comptes rendus */}
        <SectionCard title="📋 Comptes rendus" subtitle={`${completed.length} réunion(s) terminée(s)`}>
          {completed.length === 0 ? (
            <EmptyState icon="📋" message="Aucun compte rendu" sub="Les comptes rendus apparaissent après chaque réunion" />
          ) : (
            <div className="space-y-3 p-4">
              {completed.map(m => (
                <details key={m.id} className="bg-surface border border-border rounded-xl overflow-hidden group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-border/30 transition-colors">
                    <div>
                      <span className="font-semibold text-sm text-ink">{m.title}</span>
                      <span className="text-xs text-muted ml-3">{formatDate(m.date)}</span>
                    </div>
                    <span className="text-muted text-xs group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-4 pt-0 space-y-4 border-t border-border">
                    {m.summary && (
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">Résumé IA</p>
                        <p className="text-sm text-ink leading-relaxed">{m.summary}</p>
                      </div>
                    )}
                    {m.decisions.length > 0 && (
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">Décisions</p>
                        <ul className="space-y-1">
                          {m.decisions.map((d, i) => (
                            <li key={i} className="text-sm text-ink flex gap-2">
                              <span className="text-highlight">✓</span>{d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {m.actions.length > 0 && (
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">Actions</p>
                        <div className="space-y-2">
                          {m.actions.map(a => (
                            <div key={a.id} className="flex items-center gap-3">
                              <button
                                onClick={() => dispatch({ type: 'TOGGLE_ACTION', payload: { meetingId: m.id, actionId: a.id } })}
                                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
                                  a.completed ? 'bg-success border-success text-white' : 'border-border hover:border-accent'
                                }`}
                              >
                                {a.completed && '✓'}
                              </button>
                              <span className={`text-sm ${a.completed ? 'line-through text-muted' : 'text-ink'}`}>
                                {a.description}
                              </span>
                              <span className="text-xs text-muted ml-auto">{a.assignedTo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
