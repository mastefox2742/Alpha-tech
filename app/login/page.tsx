'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCurrentUser } from '@/components/layout/AuthGuard';
import { authService } from '@/lib/services/auth.service';

type Mode = 'login' | 'forgot';

export default function LoginPage() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Récupère le résultat du redirect Google (mobile)
  useEffect(() => {
    authService.handleGoogleRedirect().subscribe(result => {
      if (result?.error) { setError(result.error); setLoading(false); }
      // Si succès, user$ émettra automatiquement et le useEffect ci-dessous redirigera
    });
  }, []);

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'staff' || user.role === 'admin' ? '/staff' : '/client');
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    authService.login(email, password).subscribe(result => {
      if (result.error) { setError(result.error); setLoading(false); }
    });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    authService.sendPasswordReset(email).subscribe({
      next: () => { setResetSent(true); setLoading(false); },
      error: () => { setError("Impossible d'envoyer le lien. Vérifiez l'adresse email."); setLoading(false); },
    });
  };

  const handleGoogle = () => {
    setLoading(true);
    setError('');
    authService.loginWithGoogle().subscribe(result => {
      if (result.error) { setError(result.error); setLoading(false); }
    });
  };

  const switchToForgot = () => { setMode('forgot'); setError(''); setPassword(''); };
  const switchToLogin  = () => { setMode('login');  setError(''); setResetSent(false); };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up mt-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden relative">
              <Image src="/logo.jpg" alt="Alpha Tech" fill sizes="48px" className="object-cover" priority />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-ink leading-none">Alpha Tech</div>
              <div className="text-sm text-muted font-mono tracking-wider">PORTAIL SÉCURISÉ</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">
            {mode === 'login' ? 'Bienvenue' : 'Réinitialiser le mot de passe'}
          </h1>
          <p className="text-muted text-sm">
            {mode === 'login'
              ? 'Authentifiez-vous pour accéder à votre espace'
              : 'Entrez votre email pour recevoir un lien de réinitialisation'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* ── Mode LOGIN ── */}
          {mode === 'login' && (
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg border border-danger/20">{error}</div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink">Adresse Email</label>
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="exemple@email.com"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-ink">Mot de passe</label>
                    <button type="button" onClick={switchToForgot} className="text-xs text-primary hover:underline">
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <input
                    type="password" required autoComplete="current-password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-primary text-white font-medium rounded-lg px-4 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12"
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Se connecter'}
                </button>
              </form>

              <div className="pt-4 border-t border-border relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
                  <span className="text-xs text-muted">ou</span>
                </div>
                <button
                  type="button" onClick={handleGoogle} disabled={loading}
                  className="w-full bg-bg border border-border text-ink font-medium rounded-lg px-4 py-3 hover:bg-accent/5 transition-colors disabled:opacity-50 flex justify-center items-center h-12 relative"
                >
                  <div className="absolute left-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          )}

          {/* ── Mode MOT DE PASSE OUBLIÉ ── */}
          {mode === 'forgot' && (
            <div className="p-6 space-y-4">
              {resetSent ? (
                <div className="text-center py-6 space-y-4">
                  <div className="text-5xl">📬</div>
                  <p className="font-bold text-ink text-lg">Email envoyé !</p>
                  <p className="text-sm text-muted leading-relaxed">
                    Un lien de réinitialisation a été envoyé à<br />
                    <span className="font-semibold text-ink">{email}</span>.<br />
                    Vérifiez votre boîte mail et les spams.
                  </p>
                  <button onClick={switchToLogin} className="mt-2 text-sm text-primary hover:underline font-medium">
                    ← Retour à la connexion
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg border border-danger/20">{error}</div>
                  )}
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink">Adresse Email du compte</label>
                      <input
                        type="email" required autoComplete="email"
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="exemple@email.com"
                      />
                    </div>
                    <button
                      type="submit" disabled={loading}
                      className="w-full bg-primary text-white font-medium rounded-lg px-4 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center h-12"
                    >
                      {loading
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Envoyer le lien de réinitialisation'}
                    </button>
                  </form>
                  <button onClick={switchToLogin} className="w-full text-sm text-muted hover:text-ink text-center pt-1">
                    ← Retour à la connexion
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center pb-8">
          <p className="text-xs text-muted font-mono">Alpha Tech · Zero-Trust Security</p>
        </div>
      </div>
    </div>
  );
}