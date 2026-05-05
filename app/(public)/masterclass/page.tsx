import Link from "next/link";
import { Play, ArrowRightCircle, CheckCircle2, ChevronDown } from "lucide-react";

export default function Masterclass() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 mb-24 grid md:grid-cols-2 gap-16 items-center pt-32">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Édition Exclusive 2024
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 leading-tight">
            Mastering Digital <span className="text-primary italic">Innovation.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Une immersion intensive de 4 semaines pour maîtriser les
            technologies de pointe et les stratégies de leadership qui
            définissent le marché actuel.
          </p>
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-8 mb-10">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">3h</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                De Session Live
              </span>
            </div>
            <div className="w-px h-10 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">4</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Experts Réunis
              </span>
            </div>
            <div className="w-px h-10 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">Teams</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Visioconférence
              </span>
            </div>
          </div>
          <Link
            href="/inscription"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-medium text-primary-foreground bg-primary rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            S'inscrire Maintenant
            <ArrowRightCircle className="w-6 h-6" />
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 rounded-[3rem] rotate-3 scale-105"></div>
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-border">
            <img
              alt="Masterclass Video Preview"
              src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/lBbxWKmog4O/components/wWxfnIiP1PM.png"
              className="w-full h-full object-cover"
            />
            <button className="absolute inset-0 flex items-center justify-center group">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-2" />
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-4xl font-bold text-center mb-16">
            L'Essentiel en 3 Heures
          </h2>
          <div className="space-y-6">
            <div className="group bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <h3 className="font-heading text-2xl font-bold mb-2">
                1. Naviguer les Nouveaux Paradigmes
              </h3>
              <p className="text-muted-foreground">
                Où se dirige l'industrie technologique en 2025 et au-delà.
              </p>
            </div>
            <div className="group bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <h3 className="font-heading text-2xl font-bold mb-2">
                2. Intégrer l'IA dans vos Process
              </h3>
              <p className="text-muted-foreground">
                Cas concrets de gains de productivité et d'innovation produit.
              </p>
            </div>
            <div className="group bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <h3 className="font-heading text-2xl font-bold mb-2">
                3. Leadership Technologique
              </h3>
              <p className="text-muted-foreground">
                Les clés pour rallier vos équipes autour d'une vision forte.
              </p>
            </div>
            <div className="group bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors">
              <h3 className="font-heading text-2xl font-bold mb-2">
                4. Session Questions &amp; Réponses (30 min)
              </h3>
              <p className="text-muted-foreground">
                Échangez directement avec nos experts pour vos défis spécifiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary/20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            <details open className="group bg-background p-6 rounded-2xl border border-border">
              <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                Quelle est la durée totale de la masterclass ?
                <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                La session dure 3 heures au total, rythmée par différentes interventions et suivie d'un temps d'échange de 30 minutes via Microsoft Teams.
              </p>
            </details>
            <details className="group bg-background p-6 rounded-2xl border border-border">
              <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                Y a-t-il un replay disponible ?
                <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                Afin de privilégier des échanges confidentiels et une interaction directe avec les intervenants, cette session se vit exclusivement en direct. Il n'y aura pas de rediffusion.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section
        id="enroll"
        className="py-32 bg-primary text-primary-foreground text-center relative overflow-hidden"
      >
        <div
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C5A880 0, #C5A880 1px, transparent 0, transparent 50%)",
            backgroundSize: "30px 30px",
          }}
          className="absolute inset-0 opacity-10"
        ></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-5xl font-bold mb-8">
            Prenez les rênes de votre futur.
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-12">
            Les places sont limitées pour garantir une expérience personnalisée
            de haute qualité. Ne laissez pas passer cette opportunité unique.
          </p>
          <div className="bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-white/20 inline-block mb-12">
            <div className="text-5xl font-black mb-2 uppercase text-accent">
              Gratuit
            </div>
            <p className="text-sm uppercase tracking-widest text-primary-foreground/80 font-bold">
              Places Limitées • Inscription requise
            </p>
          </div>
          <div>
            <Link
              href="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-8 py-5 sm:px-14 sm:py-6 text-xl sm:text-2xl font-bold text-primary bg-white rounded-full hover:bg-secondary transition-all shadow-2xl"
            >
              Rejoindre la Masterclass
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
