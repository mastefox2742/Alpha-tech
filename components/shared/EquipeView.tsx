'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Badge } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { teamService } from '@/lib/services/team.service';
import { authService, UserRole } from '@/lib/services/auth.service';
import { toast } from 'sonner';
import { UserPlus, X, Copy, Check, RefreshCw } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function generatePassword(): string {
  const alpha = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$';
  let pwd = 'At';
  for (let i = 0; i < 5; i++) pwd += alpha.charAt(Math.floor(Math.random() * alpha.length));
  pwd += digits.charAt(Math.floor(Math.random() * digits.length));
  pwd += special.charAt(Math.floor(Math.random() * special.length));
  return pwd;
}

function previewEmail(firstName: string, lastName: string, role: string): string {
  if (!firstName && !lastName) return '';
  const base = `${firstName.charAt(0)}.${lastName}`
    .toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (role === 'admin') return `${base}@admin.alpha.com`;
  if (role === 'staff') return `${base}@staff.alpha.com`;
  return '';
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateForm {
  firstName: string;
  lastName: string;
  role: UserRole;
  clientEmail: string;
  password: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EquipeView({ role }: { role: 'client' | 'staff' }) {
  const { state } = useApp();
  const isAdmin = state.currentUser?.role === 'admin';

  // ── Create employee modal state ──
  const [showModal, setShowModal]   = useState(false);
  const [creating, setCreating]     = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState<CreateForm>({
    firstName: '', lastName: '', role: 'staff', clientEmail: '', password: generatePassword(),
  });
  const [copied, setCopied] = useState<'email' | 'pwd' | null>(null);

  const emailPreview =
    form.role === 'client' ? form.clientEmail : previewEmail(form.firstName, form.lastName, form.role);

  function copyText(text: string, field: 'email' | 'pwd') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function resetModal() {
    setShowModal(false);
    setCreatedCreds(null);
    setCreating(false);
    setForm({ firstName: '', lastName: '', role: 'staff', clientEmail: '', password: generatePassword() });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Prénom et nom requis');
      return;
    }
    if (form.role === 'client' && !form.clientEmail.trim()) {
      toast.error('Email requis pour un compte client');
      return;
    }
    setCreating(true);
    try {
      const { email } = await authService.createEmployee(
        form.firstName.trim(),
        form.lastName.trim(),
        form.role,
        form.password,
        form.role === 'client' ? form.clientEmail.trim() : undefined,
      );
      setCreatedCreds({ email, password: form.password });
      toast.success('Compte créé avec succès');
    } catch (err: any) {
      const msg = err?.code === 'auth/email-already-in-use'
        ? 'Un compte existe déjà avec cet email.'
        : err?.message ?? 'Erreur lors de la création du compte.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  // ── Team management ──

  const deleteMember = async (id: string) => {
    if (confirm("Voulez-vous vraiment retirer ce membre de l'équipe ?")) {
      try {
        await teamService.deleteTeamMember(id);
        toast.success('Membre retiré');
      } catch {
        toast.error('Erreur lors du retrait');
      }
    }
  };

  const toggleSlides = async (id: string, current: boolean) => {
    try {
      await teamService.updateTeamMember(id, { slidesReady: !current });
    } catch {
      toast.error('Erreur de mise à jour');
    }
  };

  const changeTitle = async (id: string, currentTitle: string) => {
    const newTitle = prompt('Nouveau titre/poste :', currentTitle);
    if (newTitle !== null && newTitle !== currentTitle) {
      try {
        await teamService.updateTeamMember(id, { jobTitle: newTitle });
        toast.success('Titre mis à jour');
      } catch {
        toast.error('Erreur');
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in">
      <Header
        role={role}
        title="L'Équipe"
        subtitle="Statut et responsabilités"
        action={
          isAdmin && role === 'staff' ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-highlight text-white rounded-xl text-sm font-semibold hover:bg-highlight/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Créer un compte</span>
            </button>
          ) : undefined
        }
      />

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
                  {isAdmin && (
                    <button onClick={() => deleteMember(m.id)} className="text-danger hover:underline text-xs">
                      Retirer
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted">{m.jobTitle || 'Membre'}</p>
                    {isAdmin && (
                      <button onClick={() => changeTitle(m.id, m.jobTitle || '')} className="text-muted hover:text-ink text-xs" title="Modifier le poste">
                        ✏️
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {m.role === 'admin' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-red-100 text-red-700">Admin</span>}
                    {m.role === 'staff' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-blue-100 text-blue-700">Staff</span>}
                    {m.role === 'team'  && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-green-100 text-green-700">Équipe</span>}
                    {m.role === 'client' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-gray-100 text-gray-700">Client</span>}
                    {isAdmin && (
                      <select
                        className="text-xs bg-surface border border-border rounded px-2 py-1 ml-2"
                        value={m.role}
                        onChange={async e => {
                          if (confirm(`Changer le rôle en ${e.target.value} ?`)) {
                            try {
                              await teamService.updateTeamMember(m.id, { role: e.target.value as UserRole });
                              toast.success('Rôle mis à jour');
                            } catch {
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

      {/* ── Modal création de compte ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-bold text-ink">Créer un compte employé</h2>
                <p className="text-xs text-muted mt-0.5">Les identifiants seront à communiquer à l'employé</p>
              </div>
              <button onClick={resetModal} className="p-2 rounded-lg hover:bg-border/40 text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdCreds ? (
              /* ── Succès : afficher les identifiants ── */
              <div className="p-5 space-y-4">
                <div className="text-center py-2">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-bold text-ink">Compte créé avec succès !</p>
                  <p className="text-sm text-muted mt-1">Communiquez ces identifiants à l'employé de manière sécurisée.</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-bg border border-border rounded-xl p-3">
                    <p className="text-xs text-muted mb-1">Email de connexion</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-mono text-ink break-all">{createdCreds.email}</span>
                      <button
                        onClick={() => copyText(createdCreds.email, 'email')}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-border/40 text-muted hover:text-ink transition-colors"
                      >
                        {copied === 'email' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-bg border border-border rounded-xl p-3">
                    <p className="text-xs text-muted mb-1">Mot de passe temporaire</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-mono text-ink">{createdCreds.password}</span>
                      <button
                        onClick={() => copyText(createdCreds.password, 'pwd')}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-border/40 text-muted hover:text-ink transition-colors"
                      >
                        {copied === 'pwd' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted text-center">
                  L'employé peut changer son mot de passe depuis la page de connexion.
                </p>

                <button
                  onClick={resetModal}
                  className="w-full py-2.5 bg-highlight text-white rounded-xl text-sm font-semibold hover:bg-highlight/90 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              /* ── Formulaire de création ── */
              <form onSubmit={handleCreate} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Prénom</label>
                    <input
                      className="input-field"
                      placeholder="Jean"
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-field">Nom</label>
                    <input
                      className="input-field"
                      placeholder="Dupont"
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label-field">Rôle</label>
                  <select
                    className="input-field"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                  >
                    <option value="staff">Staff / Secrétaire (accès complet)</option>
                    <option value="client">Client (lecture seule)</option>
                    <option value="admin">Administrateur (contrôle total)</option>
                  </select>
                </div>

                {form.role === 'client' ? (
                  <div>
                    <label className="label-field">Email réel du client</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="client@gmail.com"
                      value={form.clientEmail}
                      onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                      required
                    />
                  </div>
                ) : (
                  <div className="bg-highlight/5 border border-highlight/20 rounded-xl p-3">
                    <p className="text-xs text-muted mb-1">Email généré automatiquement</p>
                    <p className="text-sm font-mono text-ink">
                      {emailPreview || <span className="text-muted italic">Entrez prénom + nom</span>}
                    </p>
                  </div>
                )}

                <div>
                  <label className="label-field">Mot de passe temporaire</label>
                  <div className="flex gap-2">
                    <input
                      className="input-field"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}
                      className="shrink-0 px-3 border border-border rounded-xl text-muted hover:text-ink hover:bg-border/40 transition-colors"
                      title="Générer un nouveau mot de passe"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-highlight text-white rounded-xl text-sm font-semibold hover:bg-highlight/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Créer le compte</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}