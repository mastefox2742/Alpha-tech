'use client';

import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
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
              contact@alphatech-congo.com
            </p>
          </div>
          <div className="bg-card backdrop-blur-md border border-border p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Téléphone</h3>
            <p className="text-muted-foreground text-sm">+242 06 000 00 00</p>
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
          <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Nom Complet
                </label>
                <input
                  type="text"
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
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Détaillez votre projet..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
              <span>Envoyer le Message</span>
            </button>
          </form>
        </div>
      </section>
    </>
  );
};
