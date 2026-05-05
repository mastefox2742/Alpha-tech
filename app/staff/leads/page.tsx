'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { leadService } from '@/lib/services/lead.service';
import { Lead, LeadStatus } from '@/lib/types';
import { Mail, Phone, MessageSquare, Clock, CheckCircle2, Archive, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
  nouveau:  { label: 'Nouveau',   color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: <AlertCircle className="w-3.5 h-3.5" /> },
  en_cours: { label: 'En cours',  color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
  traite:   { label: 'Traité',    color: 'bg-green-500/10 text-green-400 border-green-500/20',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  archive:  { label: 'Archivé',   color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',      icon: <Archive className="w-3.5 h-3.5" /> },
};

export default function LeadsPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState<LeadStatus | 'tous'>('tous');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  const filtered = filter === 'tous' ? state.leads : state.leads.filter(l => l.status === filter);

  async function changeStatus(lead: Lead, status: LeadStatus) {
    await leadService.updateLead(lead.id, { status });
  }

  async function saveNote(lead: Lead) {
    await leadService.updateLead(lead.id, { notes: noteValue });
    setNoteEditing(null);
  }

  function startNote(lead: Lead) {
    setNoteValue(lead.notes);
    setNoteEditing(lead.id);
  }

  return (
    <div className="animate-fade-in">
      <Header role="staff" title="Leads & CRM" subtitle="Messages reçus via le formulaire de contact" />

      <div className="p-4 md:p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(s => (
            <div key={s} className="bg-card border border-border rounded-xl p-4">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border mb-2 ${STATUS_CONFIG[s].color}`}>
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
              </div>
              <p className="text-2xl font-bold text-ink">{state.leads.filter(l => l.status === s).length}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {(['tous', 'nouveau', 'en_cours', 'traite', 'archive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filter === f
                  ? 'bg-highlight text-white border-highlight'
                  : 'bg-card border-border text-muted hover:border-highlight/40'
              }`}
            >
              {f === 'tous' ? `Tous (${state.leads.length})` : `${STATUS_CONFIG[f].label} (${state.leads.filter(l => l.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Aucun lead</p>
            <p className="text-sm">Les messages du formulaire de contact apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(lead => {
              const st = STATUS_CONFIG[lead.status];
              const isOpen = expanded === lead.id;
              return (
                <div key={lead.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-highlight/30 transition-colors">
                  {/* En-tête */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : lead.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center text-highlight font-bold shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-ink">{lead.name}</p>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${st.color}`}>
                          {st.icon} {st.label}
                        </div>
                      </div>
                      <p className="text-sm text-muted truncate">{lead.subject}</p>
                      <p className="text-xs text-muted/70">{lead.email} · {new Date(lead.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-muted shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Détail */}
                  {isOpen && (
                    <div className="border-t border-border p-4 space-y-4">
                      {/* Message */}
                      <div className="bg-surface rounded-xl p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Message</p>
                        <p className="text-sm text-ink whitespace-pre-wrap">{lead.message}</p>
                      </div>

                      {/* Contact */}
                      <div className="flex flex-wrap gap-3">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-highlight/10 text-highlight border border-highlight/20 rounded-lg text-xs font-semibold hover:bg-highlight/20">
                          <Mail className="w-3.5 h-3.5" /> Répondre par email
                        </a>
                      </div>

                      {/* Notes staff */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Notes internes</p>
                        {noteEditing === lead.id ? (
                          <div className="space-y-2">
                            <textarea
                              className="input-field w-full resize-none text-sm"
                              rows={3}
                              value={noteValue}
                              onChange={e => setNoteValue(e.target.value)}
                              placeholder="Notes internes..."
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveNote(lead)} className="px-3 py-1.5 bg-highlight text-white rounded-lg text-xs font-semibold">Sauvegarder</button>
                              <button onClick={() => setNoteEditing(null)} className="px-3 py-1.5 border border-border rounded-lg text-xs text-muted">Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-muted flex-1">{lead.notes || 'Aucune note...'}</p>
                            <button onClick={() => startNote(lead)} className="text-xs text-highlight hover:underline shrink-0">Modifier</button>
                          </div>
                        )}
                      </div>

                      {/* Changer statut */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Changer le statut</p>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(s => (
                            <button
                              key={s}
                              onClick={() => changeStatus(lead, s)}
                              disabled={lead.status === s}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${lead.status === s ? STATUS_CONFIG[s].color : 'bg-card border-border text-muted hover:border-highlight/40'}`}
                            >
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
