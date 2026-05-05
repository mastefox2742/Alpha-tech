'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { Project, ProjectStatus } from '@/lib/types';
import { Folder, Clock, CheckCircle2, XCircle, AlertCircle, Users, Calendar } from 'lucide-react';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
  en_cours:   { label: 'En cours',   color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: <AlertCircle className="w-3.5 h-3.5" /> },
  termine:    { label: 'Terminé',    color: 'bg-green-500/10 text-green-400 border-green-500/20',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  annule:     { label: 'Annulé',     color: 'bg-red-500/10 text-red-400 border-red-500/20',        icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function ClientProjetsPage() {
  const { state } = useApp();
  const [selected, setSelected] = useState<Project | null>(null);

  const progress = (p: Project) =>
    p.tasks.length ? Math.round((p.tasks.filter(t => t.completed).length / p.tasks.length) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <Header role="client" title="Projets" subtitle="Vue d'ensemble — lecture seule" />

      <div className="p-4 md:p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map(s => (
            <div key={s} className="bg-card border border-border rounded-xl p-4">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border mb-2 ${STATUS_CONFIG[s].color}`}>
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
              </div>
              <p className="text-2xl font-bold text-ink">{state.projects.filter(p => p.status === s).length}</p>
            </div>
          ))}
        </div>

        {state.projects.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun projet en cours.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {state.projects.map(p => {
              const pct = progress(p);
              const st = STATUS_CONFIG[p.status];
              return (
                <div key={p.id} onClick={() => setSelected(p)} className="bg-card border border-border rounded-2xl p-5 hover:border-accent/40 cursor-pointer transition-all">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border mb-3 ${st.color}`}>
                    {st.icon} {st.label}
                  </div>
                  <h3 className="font-bold text-ink mb-1">{p.name}</h3>
                  {p.client && <p className="text-xs text-muted mb-2">Client : {p.client}</p>}
                  {p.description && <p className="text-sm text-muted line-clamp-2 mb-3">{p.description}</p>}
                  {p.tasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>{p.tasks.filter(t => t.completed).length}/{p.tasks.length} tâches</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.teamMembers.length} membre(s)</div>
                    {p.endDate && <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(p.endDate).toLocaleDateString('fr-FR')}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal détail read-only */}
      {selected && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold text-ink">{selected.name}</h2>
                {selected.client && <p className="text-xs text-muted">Client : {selected.client}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-ink">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selected.status].color}`}>
                {STATUS_CONFIG[selected.status].icon} {STATUS_CONFIG[selected.status].label}
              </div>
              {selected.description && <p className="text-sm text-muted">{selected.description}</p>}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.startDate && <div><p className="label-field">Début</p><p className="text-ink">{new Date(selected.startDate).toLocaleDateString('fr-FR')}</p></div>}
                {selected.endDate && <div><p className="label-field">Deadline</p><p className="text-ink">{new Date(selected.endDate).toLocaleDateString('fr-FR')}</p></div>}
                {selected.budget && <div className="col-span-2"><p className="label-field">Budget</p><p className="text-ink">{selected.budget.toLocaleString()} FCFA</p></div>}
              </div>
              {selected.teamMembers.length > 0 && (
                <div>
                  <p className="label-field mb-2">Équipe</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.teamMembers.map(m => (
                      <span key={m} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.tasks.length > 0 && (
                <div>
                  <p className="label-field mb-2">Tâches ({selected.tasks.filter(t => t.completed).length}/{selected.tasks.length})</p>
                  <div className="space-y-1.5">
                    {selected.tasks.map(t => (
                      <div key={t.id} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${t.completed ? 'text-muted line-through' : 'text-ink'}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${t.completed ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                          {t.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {t.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
