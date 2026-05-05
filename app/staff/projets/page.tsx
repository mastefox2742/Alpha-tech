'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { projectService } from '@/lib/services/project.service';
import { notificationService } from '@/lib/services/notification.service';
import { Project, ProjectStatus, ProjectPriority } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { Plus, Folder, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Trash2 } from 'lucide-react';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  en_attente: { label: 'En attente',  color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
  en_cours:   { label: 'En cours',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: <AlertCircle className="w-3.5 h-3.5" /> },
  termine:    { label: 'Terminé',     color: 'bg-green-500/10 text-green-400 border-green-500/20',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  annule:     { label: 'Annulé',      color: 'bg-red-500/10 text-red-400 border-red-500/20',        icon: <XCircle className="w-3.5 h-3.5" /> },
};

const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; dot: string }> = {
  haute:   { label: 'Haute',   dot: 'bg-red-400' },
  normale: { label: 'Normale', dot: 'bg-blue-400' },
  basse:   { label: 'Basse',   dot: 'bg-gray-400' },
};

const EMPTY: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
  name: '', description: '', client: '', status: 'en_attente', priority: 'normale',
  startDate: '', endDate: '', teamMembers: [], tasks: [], notes: '', budget: undefined,
};

export default function ProjetsPage() {
  const { state } = useApp();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [teamInput, setTeamInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ProjectStatus | 'tous'>('tous');

  const filtered = filter === 'tous' ? state.projects : state.projects.filter(p => p.status === filter);

  const progress = (p: Project) => {
    if (!p.tasks.length) return 0;
    return Math.round((p.tasks.filter(t => t.completed).length / p.tasks.length) * 100);
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const id = await projectService.addProject({ ...form, createdBy: '' });
      await notificationService.send({
        title: '📁 Nouveau projet créé',
        message: `Le projet "${form.name}" a été créé${form.client ? ` pour ${form.client}` : ''}.`,
        type: 'success',
        link: `/staff/projets/${id}`,
      });
      setShowModal(false);
      setForm(EMPTY);
      setTeamInput('');
      router.push(`/staff/projets/${id}`);
    } finally {
      setSaving(false);
    }
  }

  function addMember() {
    const v = teamInput.trim();
    if (v && !form.teamMembers.includes(v)) {
      setForm(f => ({ ...f, teamMembers: [...f.teamMembers, v] }));
    }
    setTeamInput('');
  }

  async function handleDelete(p: Project, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Supprimer le projet "${p.name}" ?`)) return;
    await projectService.deleteProject(p.id);
  }

  return (
    <div className="animate-fade-in">
      <Header
        role="staff"
        title="Projets"
        subtitle="Gestion & suivi de tous les projets"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-highlight text-white rounded-xl text-sm font-semibold hover:bg-highlight/90 transition-colors shadow-lg shadow-highlight/20"
          >
            <Plus className="w-4 h-4" /> Nouveau projet
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {(['tous', 'en_cours', 'en_attente', 'termine', 'annule'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filter === f
                  ? 'bg-highlight text-white border-highlight'
                  : 'bg-card border-border text-muted hover:border-highlight/40'
              }`}
            >
              {f === 'tous' ? 'Tous' : STATUS_CONFIG[f].label}
              <span className="ml-1.5 opacity-70">
                ({f === 'tous' ? state.projects.length : state.projects.filter(p => p.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['en_cours', 'en_attente', 'termine', 'annule'] as ProjectStatus[]).map(s => (
            <div key={s} className="bg-card border border-border rounded-xl p-4">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border mb-2 ${STATUS_CONFIG[s].color}`}>
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
              </div>
              <p className="text-2xl font-bold text-ink">{state.projects.filter(p => p.status === s).length}</p>
            </div>
          ))}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Aucun projet</p>
            <p className="text-sm">Créez votre premier projet avec le bouton ci-dessus.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => {
              const pct = progress(p);
              const st = STATUS_CONFIG[p.status];
              const pr = PRIORITY_CONFIG[p.priority];
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/staff/projets/${p.id}`)}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-highlight/40 hover:shadow-lg hover:shadow-highlight/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                      {st.icon} {st.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${pr.dot}`} title={pr.label} />
                      <button
                        onClick={(e) => handleDelete(p, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-ink text-base mb-1 line-clamp-1">{p.name}</h3>
                  {p.client && <p className="text-xs text-muted mb-2">Client : {p.client}</p>}
                  {p.description && <p className="text-sm text-muted line-clamp-2 mb-3">{p.description}</p>}

                  {/* Barre de progression */}
                  {p.tasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>{p.tasks.filter(t => t.completed).length}/{p.tasks.length} tâches</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-highlight rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {p.teamMembers.slice(0, 4).map((m, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-highlight/20 border-2 border-surface flex items-center justify-center text-xs font-bold text-highlight">
                          {m.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {p.teamMembers.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-border border-2 border-surface flex items-center justify-center text-xs text-muted">
                          +{p.teamMembers.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted group-hover:text-highlight transition-colors">
                      Voir <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {p.endDate && (
                    <p className="text-xs text-muted mt-2 border-t border-border pt-2">
                      🗓 Deadline : {new Date(p.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg text-ink">Nouveau projet</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-field">Nom du projet *</label>
                  <input required className="input-field" placeholder="Ex : Refonte site web" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label-field">Client</label>
                  <input className="input-field" placeholder="Nom du client" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label-field">Description</label>
                  <textarea className="input-field resize-none" rows={2} placeholder="Brève description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="label-field">Statut</label>
                  <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Priorité</label>
                  <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as ProjectPriority }))}>
                    <option value="haute">Haute</option>
                    <option value="normale">Normale</option>
                    <option value="basse">Basse</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Date début</label>
                  <input type="date" className="input-field" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="label-field">Deadline</label>
                  <input type="date" className="input-field" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label-field">Budget (FCFA)</label>
                  <input type="number" className="input-field" placeholder="0" value={form.budget ?? ''} onChange={e => setForm(f => ({ ...f, budget: e.target.value ? Number(e.target.value) : undefined }))} />
                </div>
                <div className="col-span-2">
                  <label className="label-field">Membres de l'équipe</label>
                  <div className="flex gap-2">
                    <input className="input-field flex-1" placeholder="Nom du membre" value={teamInput} onChange={e => setTeamInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMember())} />
                    <button type="button" onClick={addMember} className="px-3 py-2 bg-highlight/10 text-highlight border border-highlight/30 rounded-xl text-sm hover:bg-highlight/20">+</button>
                  </div>
                  {form.teamMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.teamMembers.map(m => (
                        <span key={m} className="inline-flex items-center gap-1 px-2 py-1 bg-highlight/10 text-highlight text-xs rounded-full">
                          {m}
                          <button type="button" onClick={() => setForm(f => ({ ...f, teamMembers: f.teamMembers.filter(x => x !== m) }))} className="hover:text-red-400">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-border/30">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-highlight text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                  {saving ? 'Création...' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
