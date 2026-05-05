import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, Flame, Medal, Linkedin, Twitter, Instagram } from "lucide-react";

export default function APropos() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 mb-24 pt-32">
        <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] sm:h-[400px] md:h-[600px] group shadow-2xl">
          <img
            alt="Notre Siège"
            src="https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/lBbxWKmog4O/components/307BKfrh72Q.png"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
          <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-12 md:right-12">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6">
              L'émergence par l'innovation.
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl font-light">
              Guidée par l'audace et née à Brazzaville, Alpha Tech a pour ambition de sortir du vide et de révéler le potentiel technologique de l'Afrique.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-24 items-start">
          <div className="space-y-12">
            <div>
              <h2 className="font-heading text-4xl font-bold mb-6">
                Notre Genèse
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed italic border-l-4 border-accent pl-6 mb-8">
                "Nous avons pour mission d'insuffler une nouvelle dynamique technologique depuis le cœur de l'Afrique. Sortir des sentiers battus, s'imposer par les compétences."
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Née à Brazzaville d'une volonté forte d'émerger, Alpha Tech se positionne comme le catalyseur des projets ambitieux. Nous sommes déterminés à briser les plafonds de verre et à prouver que l'excellence se cultive ici.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
              <div>
                <h4 className="font-heading text-xl font-bold mb-3">Mission</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Démocratiser l'excellence technologique à travers des solutions
                  d'avant-garde et une formation d'élite.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-xl font-bold mb-3">Vision</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Devenir un acteur incontournable de l'innovation en Afrique et un pont vers le leadership technologique mondial.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-secondary p-8 rounded-3xl sm:mt-12 shadow-md">
              <Sparkles className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-heading text-xl font-bold mb-4">Excellence</h3>
              <p className="text-sm text-secondary-foreground/70">
                Nous visons la perfection dans chaque pixel, chaque ligne de code,
                chaque conseil donné.
              </p>
            </div>
            <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl">
              <ShieldCheck className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-heading text-xl font-bold mb-4">Intégrité</h3>
              <p className="text-sm text-primary-foreground/70">
                La confiance est notre monnaie la plus précieuse. Nous agissons
                avec une transparence absolue.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-3xl shadow-md">
              <Flame className="w-10 h-10 text-primary mb-6" />
              <h3 className="font-heading text-xl font-bold mb-4">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                Anticiper les besoins futurs est au cœur de notre processus
                créatif quotidien.
              </p>
            </div>
            <div className="bg-secondary p-8 rounded-3xl mt-12 shadow-md">
              <Medal className="w-10 h-10 text-accent mb-6" />
              <h3 className="font-heading text-xl font-bold mb-4">Leadership</h3>
              <p className="text-sm text-secondary-foreground/70">
                Nous formons les leaders de demain à travers notre expertise
                partagée.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Les Esprits Alpha
            </h2>
            <p className="text-muted-foreground">
              Une synergie de talents internationaux au service de votre réussite.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="group text-center">
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  alt="Fresneil MBONI"
                  src="/IMG-20260422-WA0072.jpg"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading text-2xl font-bold">
                Fresneil MBONI
              </h3>
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">
                Fondateur &amp; CEO
              </p>
              <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="group text-center">
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  alt="Jobert P"
                  src="/IMG-20260427-WA0080.jpg"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading text-2xl font-bold">Jobert PION</h3>
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">
                DIRECTEUR DE L'INNOVATION
              </p>
              <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="group text-center">
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  alt="Stefane M"
                  src="/IMG-20260429-WA0026.jpg"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading text-2xl font-bold">Stefane Rynaldi HAKOULA</h3>
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">
                Directeur Stratégique
              </p>
              <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="group text-center">
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl bg-muted flex flex-col items-center justify-center">
                <Image src="/abraham.jpg" alt="Abraham FILANKEMBO" fill sizes="(max-width: 768px) 100vw, 192px" className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-heading text-2xl font-bold">Abraham FILANKEMBO</h3>
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-4">
                CTO (Chief Technology Officer)
              </p>
              <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-8 italic">
            Prêt à écrire votre propre histoire ?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-12">
            Contactez-nous dès aujourd'hui pour explorer comment Alpha Tech peut
            transformer vos ambitions en réalité concrète.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link
              href="#"
              className="w-full md:w-auto px-10 py-4 bg-white text-primary font-bold rounded-full hover:bg-secondary transition-colors"
            >
              Nous Contacter
            </Link>
            <Link
              href="/masterclass"
              className="w-full md:w-auto px-10 py-4 border border-white/30 rounded-full hover:bg-white/10 transition-colors"
            >
              Voir la Masterclass
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
