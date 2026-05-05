'use client';

import { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l\'envoi.');
    }
  };

  return (
    <>
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
          Prenez Contact
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 text-center leading-tight">
          L'Excellence est à <span className="text-primary italic">votre portée.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 md:mb-16 text-center max-w-2xl leading-relaxed">
          Que vous souhaitiez transformer votre organisation ou participer à
          notre prochaine masterclass, notre équipe est à votre disposition.
        </p>

        <div className="w-full grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="bg-card backdrop-blur-md border border-border p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Email</h3>
            <p className="text-muted-foreground text-sm">
              atechstartup683@gmail.com
            </p>
          </div>
          <div className="bg-card backdrop-blur-md border border-border p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Téléphone</h3>
            <p className="text-muted-foreground text-sm">+242 066 469 382</p>
          </div>
          <div className="bg-card backdrop-blur-md border border-border p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Siège</h3>
            <p className="text-muted-foreground text-sm">
              Brazzaville, Centre-Ville, Congo
            </p>
          </div>
        </div>

        <div className="w-full max-w-3xl bg-card backdrop-blur-xl border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6 md:mb-8">
            Envoyez-nous un message
          </h2>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-primary" />
              <h3 className="font-heading text-2xl font-bold">Message envoyé !</h3>
              <p className="text-muted-foreground">Nous vous répondrons dans les plus brefs délais.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 px-6 py-2 border border-border rounded-xl text-sm hover:border-primary/50 transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="jean@entreprise.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Sujet
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Message
                </label>
                <textarea
                  rows={5}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Détaillez votre projet..."
                ></textarea>
              </div>
              {status === 'error' && (
                <p className="text-red-500 text-sm">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{status === 'loading' ? 'Envoi en cours...' : 'Envoyer le Message'}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};
