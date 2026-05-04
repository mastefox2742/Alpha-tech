import Link from "next/link";
import { ArrowRight, Sparkles, Server, Code, ShieldCheck, Quote, LayoutDashboard } from "lucide-react";

export default function Accueil() {
  return (
    <>
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-[url('/1777768121323.png')] bg-cover bg-center animate-zoom-in-out opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020b18]/60 via-[#061325]/80 to-[#020b18]"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-bg to-transparent z-10 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            L'IA & Le Cloud au service du Congo
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl font-black leading-[1.1] tracking-tight mb-6 md:mb-8">
            Vos données. <br />
            <span className="italic font-light text-primary">
              Votre Intelligence.
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl font-light mb-10 md:mb-14 leading-relaxed">
            Nous accompagnons les jeunes et les entrepreneurs congolais en automatisant leurs systèmes. Interrogez vos bases de données via une IA locale avancée.
          </p>
          <Link
            href="/contact"
            className="group relative inline-flex items-center justify-center gap-3 md:gap-4 px-8 py-4 md:px-12 md:py-6 text-base md:text-xl font-medium text-primary-foreground bg-primary rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_80px_-15px_rgba(0,68,204,0.6)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="tracking-wide">Découvrir nos solutions</span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="mt-20 w-full max-w-4xl mx-auto px-6 relative z-10">
          <img
            alt="Innovation Technologique"
            src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/lBbxWKmog4O/components/NvnabfGzyVH.png"
            className="w-full h-auto object-contain opacity-90 drop-shadow-2xl mix-blend-multiply"
          />
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Souveraineté des données <br />
              & IA sur-mesure.
            </h2>
            <div className="w-20 h-1 bg-accent mb-8"></div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Chez Alpha Tech, nous créons des sites, applications web et plateformes SaaS. 
              Surtout, nous connectons votre base de données à notre cloud pour y intégrer l'Intelligence Artificielle. 
              Vous pouvez dialoguer avec votre IA via un tableau de bord intuitif pour analyser, guider et maîtriser vos données en temps réel.
            </p>
            <Link
              href="/a-propos"
              className="inline-flex items-center gap-2 text-primary font-semibold uppercase tracking-wider hover:gap-4 transition-all"
            >
              Découvrir notre approche
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative order-1 md:order-2 mb-8 md:mb-0">
            <div className="absolute inset-0 bg-secondary/50 rounded-3xl -rotate-6 scale-105 origin-center hidden md:block"></div>
            <div className="relative bg-secondary p-8 md:p-12 rounded-3xl shadow-xl border border-border/50">
              <ShieldCheck className="w-12 h-12 text-accent mb-6" />
              <h3 className="font-heading text-2xl font-bold mb-4">
                100% Hébergé au Congo
              </h3>
              <p className="text-secondary-foreground/80 leading-relaxed">
                Contrairement à la majorité des pratiques actuelles, nous garantissons que vos informations restent hébergées géographiquement près de vous, assurant confidentialité et souveraineté absolue.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Nos Piliers Technologiques
            </h2>
            <p className="text-secondary-foreground/70 max-w-2xl mx-auto text-lg">
              Conçus spécialement pour les besoins de l'entrepreneuriat au Congo à travers des outils performants.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/30 group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <LayoutDashboard className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">
                Dashboard & IA
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Consultez vos données en direct et donnez vos instructions à une intelligence artificielle parfaitement intégrée dans votre tableau de bord.
              </p>
            </div>
            <div className="bg-card p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/30 group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Code className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">
                Développement SaaS
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Réalisation sur-mesure de vos sites internet, applications web et SaaS pour automatiser et digitaliser tous vos processus d'entreprise.
              </p>
            </div>
            <div className="bg-card p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/30 group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Server className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4">
                Cloud Indépendant
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Une base de données résiliente couplée à un hébergement local performant, garantissant un écosystème cloud sécurisé au Congo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-primary text-primary-foreground overflow-hidden">
        <div
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C5A880 0, #C5A880 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
          className="absolute inset-0 opacity-10"
        ></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <Sparkles className="w-16 h-16 text-accent/50 mb-8 mx-auto" />
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light italic leading-relaxed mb-10 md:mb-12">
            "Avoir notre base de données hébergée localement au Congo et pouvoir l'interroger directement via notre compte IA a transformé la performance de notre Startup de bout en bout."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <img
              alt="Fresneil MBONI"
              src="/IMG-20260422-WA0072.jpg"
              className="w-16 h-16 rounded-full border-2 border-accent object-cover"
            />
            <div className="text-left">
              <h4 className="font-bold text-lg">Fresneil MBONI</h4>
              <p className="text-primary-foreground/70 text-sm tracking-wide uppercase">
                Directeur Général Alpha Tech
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
