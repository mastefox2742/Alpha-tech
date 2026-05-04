'use client';

import { Send, User, Mail, CheckCircle2, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Inscription() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [teamsLink, setTeamsLink] = useState("");

  useEffect(() => {
    const fetchEventConfig = async () => {
      try {
        const q = query(collection(db, "event_config"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const config = querySnapshot.docs[0].data();
          if (config.teamsLink) {
            setTeamsLink(config.teamsLink);
          }
        }
      } catch (err) {
        console.error("Error fetching config:", err);
      }
    };
    fetchEventConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await addDoc(collection(db, "registrations"), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      setErrorMessage("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full bg-card backdrop-blur-xl border border-primary/30 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(212,175,55,0.15)] text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative z-10">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 relative z-10 text-foreground">
            Inscription Confirmée !
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg relative z-10">
            Merci {formData.firstName}. Votre place pour la Masterclass a été réservée avec succès.
            Vous recevrez bientôt toutes les informations nécessaires à votre adresse e-mail.
          </p>

          {teamsLink && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 w-full max-w-md relative z-10 mb-8">
              <h3 className="font-semibold text-primary mb-2 flex items-center justify-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Lien de la Masterclass
              </h3>
              <p className="text-sm text-foreground/80 mb-4">
                Le lien de connexion est déjà disponible :
              </p>
              <a
                href={teamsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-primary font-bold px-6 py-2 rounded-full hover:bg-neutral-100 transition-colors"
               >
                Rejoindre la Réunion (Teams)
              </a>
            </div>
          )}

          <Link
            href="/masterclass"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors relative z-10"
          >
            Retour à la plateforme
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
          Édition Limitée
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 md:mb-8 text-center leading-tight">
          Réservez votre place <br className="hidden md:block"/>
          pour la <span className="text-primary italic">Masterclass.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-12 text-center max-w-2xl leading-relaxed">
          Remplissez le formulaire ci-dessous pour vous inscrire à cette session exclusive. 
          Bien que la masterclass soit gratuite et ouverte à tous, les places restent limitées 
          afin de privilégier les échanges avec nos intervenants.
        </p>

        <div className="w-full bg-card backdrop-blur-xl border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="Jean"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  placeholder="Dupont"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="jean.dupont@email.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>Soumettre mon inscription</span>
              </button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                En soumettant ce formulaire, vous acceptez d'être contacté(e) concernant cette masterclass. Vos données restent confidentielles.
              </p>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
            <Link href="/masterclass" className="text-muted-foreground hover:text-primary transition-colors text-sm underline underline-offset-4">
                Retour à la présentation de la Masterclass
            </Link>
        </div>
      </section>
    </>
  );
};
