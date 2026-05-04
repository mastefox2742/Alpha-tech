'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button, Modal, Input, Select, Textarea, SectionCard, Badge } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { generateId, formatDate } from '@/lib/utils';
import { Meeting, GeneratedSummary } from '@/lib/types';
import { meetingService } from '@/lib/services/meeting.service';
import { toast } from 'sonner';

export default function NotesPage() {
  const { state, dispatch } = useApp();
  const [selectedMeetingId, setSelectedMeetingId] = useState(
    state.meetings[0]?.id ?? ''
  );
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedMeeting = state.meetings.find(m => m.id === selectedMeetingId);

  async function generateSummary() {
    if (!notes.trim()) return;
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await fetch('/api/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle: selectedMeeting?.title ?? 'Réunion',
          agenda: selectedMeeting?.agenda ?? [],
          participants: selectedMeeting?.participants ?? [],
          rawNotes: notes,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data: GeneratedSummary = await res.json();
      setGenerated(data);
    } catch (e) {
      alert('Erreur lors de la génération. Vérifiez votre clé API Anthropic dans .env.local');
    } finally {
      setGenerating(false);
    }
  }

  async function saveSummary() {
    if (!selectedMeeting || !generated) return;
    setSaving(true);
    try {
      await meetingService.updateMeeting(selectedMeeting.id, {
        rawNotes: notes,
        summary: generated.summary,
        decisions: generated.decisions,
        actions: generated.actions.map(a => ({
          id: generateId(),
          description: a.description,
          assignedTo: a.assignedTo,
          dueDate: a.dueDate,
          completed: false,
        })),
        status: 'completed',
      });
      setSaved(true);
      toast.success('Compte rendu sauvegardé');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <Header role="staff" title="Notes de réunion" subtitle="Saisie + génération IA du compte rendu" />
      <div className="p-6 space-y-4">

        {/* Select meeting */}
        <div className="bg-card border border-border rounded-xl p-4">
          <Select
            label="Réunion concernée"
            value={selectedMeetingId}
            onChange={e => setSelectedMeetingId(e.target.value)}
            options={state.meetings.map(m => ({ value: m.id, label: `${m.title} — ${formatDate(m.date)}` }))}
          />
          {selectedMeeting && (
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedMeeting.agenda.map((item, i) => (
                <span key={i} className="text-xs bg-surface px-2 py-1 rounded text-muted">{item}</span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-card border border-highlight/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-highlight">Notes brutes</p>
                <p className="text-xs text-muted mt-0.5">Tapez librement — l&apos;IA structurera automatiquement</p>
            </div>
            <Badge color="highlight">✍️ Mode saisie</Badge>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={`Saisissez les notes de la réunion ici...\n\nExemples :\n- Le leader confirme que les slides sont en cours de préparation\n- BizDev 1 doit finir ses slides avant le 1er novembre\n- Décision : répétition générale le 15 novembre à 14h\n- La secrétaire réserve la salle avant le 15 octobre`}
            className="w-full bg-surface border border-border rounded-lg px-3 py-3 text-sm text-ink
              placeholder:text-muted/40 focus:outline-none focus:border-highlight/50 transition-colors"
            style={{ minHeight: '240px', resize: 'vertical' }}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted">{notes.length} caractères</span>
            <Button
              onClick={generateSummary}
              loading={generating}
              disabled={!notes.trim()}
              variant="highlight"
              icon="🤖"
            >
              {generating ? 'Génération IA...' : 'Générer le compte rendu'}
            </Button>
          </div>
        </div>

        {/* Generated summary */}
        {generated && (
          <div className="bg-card border border-accent/20 rounded-xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-accent">Compte rendu généré par IA</p>
                <p className="text-xs text-muted mt-0.5">Vérifiez et sauvegardez</p>
              </div>
              <Button onClick={saveSummary} loading={saving} icon={saved ? '✓' : '💾'} variant={saved ? 'secondary' : 'primary'}>
                {saved ? 'Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>

            {/* Résumé */}
            <div className="mb-4">
              <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">📝 Résumé</p>
              <p className="text-sm text-ink leading-relaxed bg-surface rounded-lg p-3">{generated.summary}</p>
            </div>

            {/* Décisions */}
            {generated.decisions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">✅ Décisions</p>
                <ul className="space-y-1">
                  {generated.decisions.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink">
                      <span className="text-highlight flex-shrink-0">✓</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            {generated.actions.length > 0 && (
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">⚡ Actions détectées</p>
                <div className="space-y-2">
                  {generated.actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 bg-surface rounded-lg p-3">
                      <div className="w-4 h-4 rounded border border-border flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-ink">{a.description}</p>
                        <p className="text-xs text-muted mt-0.5">
                          Assigné à : <span className="text-accent">{a.assignedTo}</span> · Avant : {a.dueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
