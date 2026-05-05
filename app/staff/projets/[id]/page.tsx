'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { projectService } from '@/lib/services/project.service';
import { notificationService } from '@/lib/services/notification.service';
import { Project, ProjectTask, ProjectStatus, ProjectPriority } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { ArrowLeft, Plus, Check, Trash2, Edit3, Save, X, Bot, Loader2, Users, Calendar, Flag, DollarSign } from 'lucide-react';

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'en_attente', label: 'En attente',  color: 'text-yellow-400' },
  { value: 'en_cours',   label: 'En cours',    color: 'text-blue-400' },
  { value: 'termine',    label: 'Terminé',     color: 'text-green-400' },
  { value: 'annule',     label: 'Annulé',      color: 'text-red-400' },
];

const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
  { value: 'haute',   label: '🔴 Haute' },
  { value: 'normale', label: '🔵 Normale' },
  { value: 'basse',   label: '⚪ Basse' },
];

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state } = useApp();
  const project = state.projects.find(p => p.id === id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Project | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [teamInput, setTeamInput] = useState('');

  useEffect(() => {
    if (project) setForm({ ...project });
  }, [project]);

  if (!project || !form) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  const pct = form.tasks.length
    ? Math.round((form.tasks.filter(t => t.completed).length / form.tasks.length) * 100)
    : 0;

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await projectService.updateProject(form.id, form);
      await notificationService.send({
        title: '✏️ Projet mis à jour',
        message: `Le projet "${form.name}" a été modifié.`,
        type: 'info',
        link: `/staff/projets/${form.id}`,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function addTask() {
    if (!newTask.trim()) return;
    const task: ProjectTask = {
      id: generateId(),
      description: newTask.trim(),
      assignedTo: newTaskAssignee.trim(),
      dueDate: newTaskDue,
      completed: false,
    };
    setForm(f => f ? { ...f, tasks: [...f.tasks, task] } : f);
    setNewTask(''); setNewTaskAssignee(''); setNewTaskDue('');
  }

  function toggleTask(taskId: string) {
    setForm(f => f ? {
      ...f,
      tasks: f.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
    } : f);
  }

  function removeTask(taskId: string) {
    setForm(f => f ? { ...f, tasks: f.tasks.filter(t => t.id !== taskId) } : f);
  }

  function addMember() {
    const v = teamInput.trim();
    if (v && form && !form.teamMembers.includes(v)) {
      setForm(f => f ? { ...f, teamMembers: [...f.teamMembers, v] } : f);
    }
    setTeamInput('');
  }

  async function getAiSuggestion() {
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemContext: `Tu es un assistant de gestion de projet pour Alpha Tech.`,
          messages: [{
            role: 'user',
            content: `Analyse ce projet et donne des conseils pour avancer :
Nom : ${form.name}
Description : ${form.description}
Client : ${form.client}
Statut : ${form.status}
Priorité : ${form.priority}
Équipe : ${form.teamMembers.join(', ')}
Tâches (${form.tasks.filter(t => t.completed).length}/${form.tasks.length} terminées) :
${form.tasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.description} → ${t.assignedTo}`).join('\n')}
Notes : ${form.notes}

Donne 3 recommandations concrètes pour faire avancer ce projet.`,
          }],
        }),
      });
      const { content } = await res.json();
      setAiSuggestion(content);
    } finally {
      setAiLoading(false);
    }
  }

  const statusCfg = STATUS_OPTIONS.find(s => s.value === form.status)!;

  return (
    <div className="animate-fade-in">
      <Header
        role="staff"
        title={form.name}
        subtitle={form.client || 'Détail du projet'}
        action={
          <div className="flex gap-2">
            <button onClick={() => router.push('/staff/projets')} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm text-muted hover:text-ink">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); setForm({ ...project }); }} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm text-muted hover:text-ink">
                  <X className="w-4 h-4" /> Annuler
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-highlight text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sauvegarder
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-highlight text-white rounded-xl text-sm font-semibold">
                <Edit3 className="w-4 h-4" /> Modifier
              </button>
            )}
          </div>
        }
      />

      <div className="p-4 md:p-6 grid md:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="md:col-span-2 space-y-5">

          {/* Infos projet */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-bold text-ink mb-4 flex items-center gap-2"><Flag className="w-4 h-4 text-highlight" /> Informations</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-field">Nom</p>
                {editing
                  ? <input className="input-field" value={form.name} onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)} />
                  : <p className="text-ink font-semibold">{form.name}</p>}
              </div>
              <div>
                <p className="label-field">Client</p>
                {editing
                  ? <input className="input-field" value={form.client} onChange={e => setForm(f => f ? { ...f, client: e.target.value } : f)} />
                  : <p className="text-ink">{form.client || '—'}</p>}
              </div>
              <div>
                <p className="label-field">Statut</p>
                {editing
                  ? <select className="input-field" value={form.status} onChange={e => setForm(f => f ? { ...f, status: e.target.value as ProjectStatus } : f)}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  : <span className={`font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>}
              </div>
              <div>
                <p className="label-field">Priorité</p>
                {editing
                  ? <select className="input-field" value={form.priority} onChange={e => setForm(f => f ? { ...f, priority: e.target.value as ProjectPriority } : f)}>
                      {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  : <p className="text-ink">{PRIORITY_OPTIONS.find(o => o.value === form.priority)?.label}</p>}
              </div>
              <div>
                <p className="label-field"><Calendar className="w-3 h-3 inline mr-1" />Début</p>
                {editing
                  ? <input type="date" className="input-field" value={form.startDate} onChange={e => setForm(f => f ? { ...f, startDate: e.target.value } : f)} />
                  : <p className="text-ink">{form.startDate ? new Date(form.startDate).toLocaleDateString('fr-FR') : '—'}</p>}
              </div>
              <div>
                <p className="label-field"><Calendar className="w-3 h-3 inline mr-1" />Deadline</p>
                {editing
                  ? <input type="date" className="input-field" value={form.endDate} onChange={e => setForm(f => f ? { ...f, endDate: e.target.value } : f)} />
                  : <p className="text-ink">{form.endDate ? new Date(form.endDate).toLocaleDateString('fr-FR') : '—'}</p>}
              </div>
              <div className="col-span-2">
                <p className="label-field"><DollarSign className="w-3 h-3 inline mr-1" />Budget</p>
                {editing
                  ? <input type="number" className="input-field" value={form.budget ?? ''} onChange={e => setForm(f => f ? { ...f, budget: e.target.value ? Number(e.target.value) : undefined } : f)} />
                  : <p className="text-ink">{form.budget ? `${form.budget.toLocaleString()} FCFA` : '—'}</p>}
              </div>
              <div className="col-span-2">
                <p className="label-field">Description</p>
                {editing
                  ? <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(f => f ? { ...f, description: e.target.value } : f)} />
                  : <p className="text-muted text-sm">{form.description || '—'}</p>}
              </div>
            </div>
          </div>

          {/* Tâches */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink flex items-center gap-2">
                <Check className="w-4 h-4 text-highlight" /> Tâches
                <span className="text-xs font-normal text-muted">({form.tasks.filter(t => t.completed).length}/{form.tasks.length})</span>
              </h2>
              {form.tasks.length > 0 && (
                <span className="text-sm font-bold text-highlight">{pct}%</span>
              )}
            </div>

            {form.tasks.length > 0 && (
              <div className="h-1.5 bg-border rounded-full overflow-hidden mb-4">
                <div className="h-full bg-highlight rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            )}

            <div className="space-y-2 mb-4">
              {form.tasks.map(t => (
                <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${t.completed ? 'bg-green-500/5 border-green-500/10' : 'bg-surface border-border'}`}>
                  <button onClick={() => toggleTask(t.id)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${t.completed ? 'bg-green-500 border-green-500 text-white' : 'border-border hover:border-highlight'}`}>
                    {t.completed && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.completed ? 'line-through text-muted' : 'text-ink'}`}>{t.description}</p>
                    <div className="flex gap-3 mt-0.5">
                      {t.assignedTo && <span className="text-xs text-muted">→ {t.assignedTo}</span>}
                      {t.dueDate && <span className="text-xs text-muted">🗓 {new Date(t.dueDate).toLocaleDateString('fr-FR')}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeTask(t.id)} className="text-muted hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Ajouter tâche */}
            <div className="border border-dashed border-border rounded-xl p-3 space-y-2">
              <input className="input-field text-sm" placeholder="Description de la tâche..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask())} />
              <div className="flex gap-2">
                <input className="input-field text-sm flex-1" placeholder="Assigné à..." value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} />
                <input type="date" className="input-field text-sm w-36" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} />
                <button onClick={addTask} className="px-3 py-2 bg-highlight/10 text-highlight border border-highlight/30 rounded-xl text-sm hover:bg-highlight/20">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-bold text-ink mb-3">📝 Notes</h2>
            <textarea
              className="input-field resize-none w-full"
              rows={5}
              placeholder="Notes sur le projet, décisions importantes..."
              value={form.notes}
              onChange={e => setForm(f => f ? { ...f, notes: e.target.value } : f)}
            />
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-5">
          {/* Équipe */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-bold text-ink mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-highlight" /> Équipe</h2>
            <div className="space-y-2 mb-3">
              {form.teamMembers.map(m => (
                <div key={m} className="flex items-center justify-between p-2.5 bg-surface rounded-xl border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-highlight/20 flex items-center justify-center text-sm font-bold text-highlight">
                      {m.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-ink">{m}</span>
                  </div>
                  <button onClick={() => setForm(f => f ? { ...f, teamMembers: f.teamMembers.filter(x => x !== m) } : f)} className="text-muted hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {form.teamMembers.length === 0 && <p className="text-muted text-sm text-center py-2">Aucun membre assigné</p>}
            </div>
            <div className="flex gap-2">
              <input className="input-field flex-1 text-sm" placeholder="Ajouter un membre..." value={teamInput} onChange={e => setTeamInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMember())} />
              <button onClick={addMember} className="px-3 py-2 bg-highlight/10 text-highlight border border-highlight/30 rounded-xl hover:bg-highlight/20">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assistant IA */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-bold text-ink mb-3 flex items-center gap-2"><Bot className="w-4 h-4 text-highlight" /> Assistant IA</h2>
            <p className="text-xs text-muted mb-3">Obtenez des recommandations IA pour faire avancer ce projet.</p>
            <button
              onClick={getAiSuggestion}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-highlight/10 text-highlight border border-highlight/30 rounded-xl text-sm font-semibold hover:bg-highlight/20 disabled:opacity-60"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              {aiLoading ? 'Analyse...' : 'Analyser le projet'}
            </button>
            {aiSuggestion && (
              <div className="mt-3 p-3 bg-highlight/5 border border-highlight/20 rounded-xl text-xs text-ink space-y-1 leading-relaxed whitespace-pre-wrap">
                {aiSuggestion}
              </div>
            )}
          </div>

          {/* Sauvegarde rapide */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-highlight text-white rounded-xl font-semibold shadow-lg shadow-highlight/20 hover:bg-highlight/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
