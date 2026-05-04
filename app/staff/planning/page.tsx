'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button, Input, SectionCard, Badge, EmptyState } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { generateId, formatDate } from '@/lib/utils';
import { meetingService } from '@/lib/services/meeting.service';
import { toast } from 'sonner';

const PARTICIPANTS_OPTIONS = ['Toi — Le Leader', 'La Secrétaire', 'Le Dev', 'BizDev 1', 'BizDev 2'];
const LOCATIONS = ['En ligne (Zoom)', 'En ligne (Teams)', 'Brazzaville — Centre-ville', 'WhatsApp Audio', 'Autre'];

export default function PlanningStaffPage() {
  const { state, dispatch } = useApp();

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '14:00',
    location: 'En ligne (Zoom)',
    participants: [] as string[],
  });
  const [agenda, setAgenda] = useState<string[]>([]);
  const [agendaInput, setAgendaInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function toggleParticipant(p: string) {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(p)
        ? f.participants.filter(x => x !== p)
        : [...f.participants, p],
    }));
  }

  function addAgendaItem() {
    if (!agendaInput.trim()) return;
    setAgenda(a => [...a, agendaInput.trim()]);
    setAgendaInput('');
  }

  function removeAgendaItem(i: number) {
    setAgenda(a => a.filter((_, idx) => idx !== i));
  }

  async function generateAgenda() {
    if (!form.title) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/planning/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle: form.title,
          pendingActions: state.meetings.flatMap(m => m.actions).filter(a => !a.completed).map(a => a.description),
          previousMeetings: state.meetings.slice(-2).map(m => m.title),
        }),
      });
      if (!res.ok) throw new Error('API error');
      const { agenda: suggested } = await res.json();
      setAgenda(suggested);
    } catch {
      alert('Erreur IA — vérifiez votre clé API dans .env.local');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await meetingService.addMeeting({
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        participants: form.participants,
        agenda,
        rawNotes: '',
        summary: '',
        decisions: [],
        status: 'scheduled',
      });
      setForm({ title: '', date: '', time: '14:00', location: 'En ligne (Zoom)', participants: [] });
      setAgenda([]);
      setSuccess(true);
      toast.success('Réunion planifiée avec succès');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast.error('Erreur lors de la création de la réunion');
    } finally {
      setSaving(false);
    }
  }

  const upcoming = state.meetings.filter(m => m.status === 'scheduled');

  return (
    <div className="animate-fade-in">
      <Header role="staff" title="Planifier une réunion" subtitle="Créer et organiser les réunions d'équipe" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-highlight mb-4">📅 Nouvelle réunion</p>
              <form onSubmit={handleSave} className="space-y-4">

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1.5">Titre *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="ex: Réunion de préparation J-30"
                    required
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-highlight/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1.5">Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-highlight/50" />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1.5">Heure</label>
                    <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-highlight/50" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1.5">Lieu</label>
                  <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-highlight/50">
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1.5">Participants</label>
                  <div className="flex flex-wrap gap-2">
                    {PARTICIPANTS_OPTIONS.map(p => (
                      <button key={p} type="button" onClick={() => toggleParticipant(p)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          form.participants.includes(p)
                            ? 'border-highlight/50 bg-highlight/12 text-highlight'
                            : 'border-border text-muted hover:border-muted'
                        }`}>
                        {p.split('—')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agenda */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted">Ordre du jour</label>
                    <Button type="button" variant="ghost" size="sm" loading={generating} onClick={generateAgenda} icon="🤖">
                      IA suggère
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={agendaInput}
                      onChange={e => setAgendaInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAgendaItem())}
                      placeholder="Ajouter un point..."
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-highlight/50"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={addAgendaItem}>+</Button>
                  </div>
                  {agenda.length > 0 && (
                    <ul className="space-y-1">
                      {agenda.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 text-sm text-ink">
                          <span className="text-muted text-xs">{i + 1}.</span>
                          <span className="flex-1">{item}</span>
                          <button type="button" onClick={() => removeAgendaItem(i)} className="text-muted hover:text-danger text-lg leading-none">×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button type="submit" loading={saving} variant={success ? 'secondary' : 'highlight'} className="w-full justify-center" icon={success ? '✓' : '📅'}>
                  {success ? 'Réunion créée !' : 'Créer la réunion'}
                </Button>
              </form>
            </div>
          </div>

          {/* Upcoming */}
          <div className="lg:col-span-2">
            <SectionCard title={`📋 Planifiées (${upcoming.length})`}>
              {upcoming.length === 0 ? (
                <EmptyState icon="📅" message="Aucune réunion" sub="Créez-en une avec le formulaire" />
              ) : (
                <div className="divide-y divide-border">
                  {upcoming.map(m => (
                    <div key={m.id} className="p-4">
                      <p className="font-semibold text-sm text-ink mb-1">{m.title}</p>
                      <p className="text-xs text-muted">{formatDate(m.date)} · {m.time}</p>
                      <p className="text-xs text-muted">{m.location}</p>
                      {m.agenda.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {m.agenda.slice(0, 3).map((a, i) => (
                            <li key={i} className="text-xs text-muted pl-2 border-l border-border truncate">{a}</li>
                          ))}
                          {m.agenda.length > 3 && <li className="text-xs text-muted pl-2">+{m.agenda.length - 3} autres</li>}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
