'use client';

import { useState, useRef } from 'react';
import Header from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { useCurrentUser } from '@/components/layout/AuthGuard';
import { teamService } from '@/lib/services/team.service';
import { authService, UserRole } from '@/lib/services/auth.service';
import { TeamMember } from '@/lib/types';
import { toast } from 'sonner';
import { UserPlus, X, Copy, Check, RefreshCw, Camera, Pencil } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generatePassword(): string {
  const alpha   = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
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
  if (role === 'admin')  return `${base}@admin.alpha.com`;
  if (role === 'staff')  return `${base}@staff.alpha.com`;
  if (role === 'client') return `${base}@team.alpha.com`;
  return '';
}

function getInitials(name: string): string {
  return name.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MemberAvatar({
  name, photoURL, size = 'md',
}: { name: string; photoURL?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-10 h-10 text-sm', md: 'w-14 h-14 text-lg', lg: 'w-20 h-20 text-2xl' }[size];
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 border-2 border-border`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-highlight/15 border-2 border-highlight/20 flex items-center justify-center font-bold text-highlight flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, string> = {
    admin:  'bg-red-100 text-red-700',
    staff:  'bg-blue-100 text-blue-700',
    team:   'bg-green-100 text-green-700',
    client: 'bg-gray-100 text-gray-700',
  };
  const labels: Record<string, string> = { admin: 'Admin', staff: 'Staff', team: 'Équipe', client: 'Client' };
  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${cfg[role] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[role] ?? role}
    </span>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateForm {
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EquipeView({ role }: { role: 'client' | 'staff' }) {
  const { state } = useApp();
  const { user: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.isAdmin === true;

  // ── Create account modal ──
  const [showModal, setShowModal]       = useState(false);
  const [creating, setCreating]         = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm]                 = useState<CreateForm>({
    firstName: '', lastName: '', role: 'staff', password: generatePassword(),
  });
  const [copied, setCopied] = useState<'email' | 'pwd' | null>(null);

  // ── Profile edit modal ──
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [profileJobTitle, setProfileJobTitle] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState<string | null>(null);
  const [uploading, setUploading]             = useState(false);
  const [savingProfile, setSavingProfile]     = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const emailPreview = previewEmail(form.firstName, form.lastName, form.role);

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
    setForm({ firstName: '', lastName: '', role: 'staff', password: generatePassword() });
  }

  function openEdit(member: TeamMember) {
    setEditingMember(member);
    setProfileJobTitle(member.jobTitle ?? '');
    setProfilePhotoURL(member.photoURL ?? null);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;
    setUploading(true);
    try {
      const url = await teamService.uploadPhoto(editingMember.id, file);
      setProfilePhotoURL(url);
      toast.success('Photo mise à jour');
    } catch {
      toast.error("Erreur lors de l'envoi de la photo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveProfile() {
    if (!editingMember) return;
    setSavingProfile(true);
    try {
      await teamService.updateProfile(editingMember.id, {
        jobTitle: profileJobTitle,
        ...(profilePhotoURL !== (editingMember.photoURL ?? null) ? { photoURL: profilePhotoURL ?? '' } : {}),
      });
      toast.success('Profil mis à jour');
      setEditingMember(null);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Prénom et nom requis');
      return;
    }
    setCreating(true);
    try {
      const { email } = await authService.createEmployee(
        form.firstName.trim(),
        form.lastName.trim(),
        form.role,
        form.password,
      );
      setCreatedCreds({ email, password: form.password });
      toast.success('Compte créé avec succès');
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const msg = e?.code === 'auth/email-already-in-use'
        ? 'Un compte existe déjà avec cet email.'
        : e?.message ?? 'Erreur lors de la création du compte.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in">
      <Header
        role={role}
        title="L'Équipe"
        subtitle="Membres et responsabilités"
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

<div className="p-4 md:p-6 space-y-3">
        {state.teamMembers.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <div className="text-5xl mb-4">👥</div>
            <p className="font-semibold text-ink">Aucun membre pour l'instant</p>
            {isAdmin && (
              <p className="text-sm mt-1">Utilisez le bouton &quot;Créer un compte&quot; pour inviter votre équipe.</p>
            )}
          </div>
        ) : (
          state.teamMembers.map(m => {
            const isOwnCard = currentUser?.uid === m.id;
            const canEdit   = isOwnCard || isAdmin;

            return (
              <div key={m.id} className="bg-card border border-border rounded-xl p-4 md:p-5 hover-card">
                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <MemberAvatar name={m.name} photoURL={m.photoURL} />
                    {isOwnCard && (
                      <button
                        onClick={() => openEdit(m)}
                        title="Changer ma photo"
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-highlight text-white rounded-full flex items-center justify-center hover:bg-highlight/90 transition-colors shadow"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {/* Nom + badge rôle */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-ink">{m.name}</h3>
                          <RoleBadge role={m.role} />
                        </div>

                        {/* Fonction */}
                        <p className="text-sm text-muted mt-0.5">
                          {m.jobTitle
                            ? m.jobTitle
                            : <span className="italic opacity-50 text-xs">Fonction non définie</span>}
                        </p>

                        {/* Email */}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            className="text-xs text-highlight hover:underline mt-1 block truncate"
                          >
                            {m.email}
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(m)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted border border-border rounded-lg hover:text-ink hover:border-ink/30 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            <span className="hidden sm:inline">{isOwnCard ? 'Mon profil' : 'Modifier'}</span>
                          </button>
                        )}
                        {isAdmin && !isOwnCard && (
                          <button
                            onClick={() => deleteMember(m.id)}
                            className="text-xs text-danger hover:underline"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Changement de rôle — admin uniquement */}
                    {isAdmin && (
                      <div className="mt-3">
                        <select
                          className="text-xs bg-surface border border-border rounded px-2 py-1"
                          value={m.role}
                          onChange={async e => {
                            if (confirm(`Changer le rôle en « ${e.target.value} » ?`)) {
                              try {
                                await teamService.changeRole(m.id, e.target.value);
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal : modifier profil ── */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-bold text-ink">
                  {currentUser?.uid === editingMember.id ? 'Mon profil' : `Modifier — ${editingMember.name}`}
                </h2>
                <p className="text-xs text-muted mt-0.5 font-mono">{editingMember.email}</p>
              </div>
              <button onClick={() => setEditingMember(null)} className="p-2 rounded-lg hover:bg-border/40 text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Photo — seulement pour sa propre fiche */}
              {currentUser?.uid === editingMember.id && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <MemberAvatar name={editingMember.name} photoURL={profilePhotoURL} size="lg" />
                    <label
                      className="absolute bottom-0 right-0 w-8 h-8 bg-highlight text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-highlight/90 shadow transition-colors"
                      title="Changer la photo"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                  {uploading && (
                    <p className="text-xs text-muted animate-pulse">Envoi en cours…</p>
                  )}
                  <p className="text-xs text-muted text-center">
                    Cliquez sur l'icône photo pour changer votre avatar
                  </p>
                </div>
              )}

              {/* Fonction */}
              <div>
                <label className="label-field">Fonction / Poste dans l'entreprise</label>
                <input
                  className="input-field"
                  placeholder="Ex : Développeur Full-Stack"
                  value={profileJobTitle}
                  onChange={e => setProfileJobTitle(e.target.value)}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || uploading}
                className="w-full py-3 bg-highlight text-white rounded-xl text-sm font-semibold hover:bg-highlight/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingProfile
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : créer un compte ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md">
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

                <div className="bg-highlight/5 border border-highlight/20 rounded-xl p-3">
                  <p className="text-xs text-muted mb-1">Email généré automatiquement</p>
                  <p className="text-sm font-mono text-ink">
                    {emailPreview || <span className="text-muted italic">Entrez prénom + nom</span>}
                  </p>
                </div>

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
                  {creating
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><UserPlus className="w-4 h-4" /> Créer le compte</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}