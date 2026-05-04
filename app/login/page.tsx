'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCurrentUser } from '@/components/layout/AuthGuard';
import { authService } from '@/lib/services/auth.service';

type AuthMode = 'login' | 'register';
type RoleChoice = 'client' | 'staff' | 'admin';

export default function LoginPage() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<RoleChoice>('client');

  useEffect(() => {
    if (user) {
      if (user.role === 'staff' || user.role === 'admin') {
        router.replace('/staff');
      } else {
        router.replace('/client');
      }
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      authService.login(email, password).subscribe(result => {
        if (result.error) {
          setError(result.error);
          setLoading(false);
        }
      });
    } else {
      let finalEmail = email;
      if (role === 'admin') {
        finalEmail = `${firstName.charAt(0)}.${lastName}@admin.alpha.com`.toLowerCase().replace(/\s+/g, '');
      } else if (role === 'staff') {
        finalEmail = `${firstName.charAt(0)}.${lastName}@staff.alpha.com`.toLowerCase().replace(/\s+/g, '');
      }

      if (!finalEmail) {
        setError('Adresse email invalide');
        setLoading(false);
        return;
      }

      authService.register(finalEmail, password, firstName, lastName).subscribe(result => {
        if (result.error) {
          setError(result.error);
          setLoading(false);
        }
      });
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    authService.loginWithGoogle().subscribe(result => {
      if (result.error) {
        setError(result.error);
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up mt-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl shadow-sm overflow-hidden relative">
              <Image src="/logo.jpg" alt="Alpha tech" fill sizes="48px" className="object-cover" referrerPolicy="no-referrer" priority />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-ink leading-none">Alpha Tech</div>
              <div className="text-sm text-muted font-mono tracking-wider">PORTAIL SÉCURISÉ</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">
            {mode === 'login' ? 'Bienvenue' : 'Créer un profil'}
          </h1>
          <p className="text-muted text-sm">
            {mode === 'login' ? 'Authentifiez-vous pour accéder à votre espace' : 'Remplissez les informations pour générer votre compte'}
          </p>
        </div>

        {/* Login form */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-ink'}`}
            >
              Connexion
            </button>
            <button
               onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'register' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-ink'}`}
            >
              Inscription
            </button>
          </div>

          <div className="p-6">
            {error && <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg border border-danger/20 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink">Prénom</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink">Nom de famille</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink">Type de compte</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleChoice)}
                      className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      <option value="client">Client Externe (Personnel)</option>
                      <option value="staff">Équipe Alpha Tech (Secrétaire/Staff)</option>
                      <option value="admin">Administrateur (Direction)</option>
                    </select>
                  </div>
                </>
              )}

              {(mode === 'login' || role === 'client') && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="exemple@email.com"
                  />
                </div>
              )}

              {mode === 'register' && role !== 'client' && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-xs text-muted mb-1">Email généré automatiquement :</p>
                  <p className="text-sm font-mono text-ink">
                    {firstName && lastName 
                      ? `${firstName.charAt(0)}.${lastName}@${role === 'admin' ? 'admin' : 'staff'}.alpha.com`.toLowerCase().replace(/\s+/g, '') 
                      : `*.*@${role === 'admin' ? 'admin' : 'staff'}.alpha.com`}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-medium rounded-lg px-4 py-3 mt-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  mode === 'login' ? 'Se connecter' : 'Créer le profil'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-4 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
                <span className="text-xs text-muted">ou</span>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-bg border border-border text-ink font-medium rounded-lg px-4 py-3 hover:bg-accent/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12 relative overflow-hidden"
              >
                <div className="absolute left-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.63 12 18.63C9.16 18.63 6.75 16.71 5.86 14.14H2.18V16.99C3.99 20.59 7.69 23 12 23Z" fill="#34A853"/>
                    <path d="M5.86 14.14C5.63 13.47 5.5 12.75 5.5 12C5.5 11.25 5.63 10.53 5.86 9.86V7.01H2.18C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.18 16.99L5.86 14.14Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.36 3.86C17.45 2.09 14.97 1 12 1C7.69 1 3.99 3.41 2.18 7.01L5.86 9.86C6.75 7.29 9.16 5.38 12 5.38Z" fill="#EA4335"/>
                  </svg>
                </div>
                Continuer avec Google
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-8">
          <p className="text-xs text-muted font-mono">
            Alpha Tech · Zero-Trust Security
          </p>
        </div>
      </div>
    </div>
  );
}
