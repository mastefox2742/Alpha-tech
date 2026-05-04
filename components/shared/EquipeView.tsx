'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Badge, Button, SectionCard } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { teamService } from '@/lib/services/team.service';
import { toast } from 'sonner';

export default function EquipeView({ role }: { role: 'client' | 'staff' }) {
  const { state, dispatch } = useApp();

  const deleteMember = async (id: string) => {
    if (confirm('Voulez-vous vraiment retirer ce membre de l\'équipe ?')) {
      try {
        await teamService.deleteTeamMember(id);
        toast.success('Membre retiré');
      } catch (err) {
        toast.error('Erreur lors du retrait');
      }
    }
  };

  const toggleSlides = async (id: string, current: boolean) => {
    const m = state.teamMembers.find(member => member.id === id);
    if (m) {
      try {
        await teamService.updateTeamMember(id, { slidesReady: !current });
      } catch (err) {
        toast.error('Erreur de mise à jour');
      }
    }
  };

  const changeTitle = async (id: string, currentTitle: string) => {
    const newTitle = prompt('Nouveau titre/poste :', currentTitle);
    if (newTitle !== null && newTitle !== currentTitle) {
      try {
        await teamService.updateTeamMember(id, { jobTitle: newTitle });
        toast.success('Titre mis à jour');
      } catch (err) {
        toast.error('Erreur');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <Header role={role} title="L'Équipe" subtitle="Statut et responsabilités" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {state.teamMembers.map(m => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-5 hover-card">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${role === 'client' ? 'bg-primary/15' : 'bg-highlight/15'}`}>
                👤
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-ink">{m.name}</h3>
                    <div className={`flex items-center gap-1.5 text-xs ${m.isOnline ? 'text-success' : 'text-muted'}`}>
                      <div className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-success' : 'bg-muted'}`} />
                      {m.isOnline ? 'En ligne' : 'Hors ligne'}
                    </div>
                  </div>
                  {state.currentUser?.role === 'admin' && (
                    <button onClick={() => deleteMember(m.id)} className="text-danger hover:underline text-xs">
                      Retirer
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted">{m.jobTitle || 'Membre'}</p>
                    {state.currentUser?.role === 'admin' && (
                      <button onClick={() => changeTitle(m.id, m.jobTitle || '')} className="text-muted hover:text-ink text-xs" title="Modifier le poste">
                        ✏️
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.role === 'admin' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-red-100 text-red-700">Admin</span>}
                    {m.role === 'staff' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-blue-100 text-blue-700">Staff</span>}
                    {m.role === 'team' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-green-100 text-green-700">Équipe</span>}
                    {m.role === 'client' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-gray-100 text-gray-700">Client</span>}
                  
                    {state.currentUser?.role === 'admin' && (
                      <select
                        className="text-xs bg-surface border border-border rounded px-2 py-1 ml-2"
                        value={m.role}
                        onChange={async (e) => {
                          if (confirm(`Changer le rôle en ${e.target.value} ?`)) {
                            try {
                              await teamService.updateTeamMember(m.id, { role: e.target.value as any });
                              toast.success('Rôle mis à jour');
                            } catch (err) {
                              toast.error('Erreur');
                            }
                          }
                        }}
                      >
                        <option value="client">Client</option>
                        <option value="team">Équipe</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted mb-3">📍 {m.location}</p>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => toggleSlides(m.id, m.slidesReady)}>
                    <Badge color={m.slidesReady ? 'success' : 'muted'}>
                      {m.slidesReady ? '✓ Slides prêtes' : '⏳ Slides en cours'}
                    </Badge>
                  </button>
                  {m.email && (
                    <a href={`mailto:${m.email}`} className={`text-xs hover:underline ${role === 'client' ? 'text-primary' : 'text-highlight'}`}>
                      {m.email}
                    </a>
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">Tâches</p>
                  <ul className="space-y-1">
                    {m.tasks.map((t, i) => (
                      <li key={i} className="text-xs text-muted flex gap-2">
                        <span className={role === 'client' ? 'text-primary' : 'text-highlight'}>→</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
