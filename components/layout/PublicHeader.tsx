'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Linkedin, Twitter, InfinityIcon } from "lucide-react";

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const getLinkClass = (path: string, isMobile: boolean = false) => {
    const baseClass = "font-medium hover:text-primary transition-colors uppercase tracking-widest";
    const sizeClass = isMobile ? "text-lg py-2 block w-full text-left" : "text-sm inline-block";
    const colorClass = pathname === path ? "text-primary" : "text-ink/80 md:text-muted";
    return `${baseClass} ${sizeClass} ${colorClass}`;
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          <Image src="/logo.jpg" alt="Alpha Tech Logo" width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
          <span className="font-heading font-bold text-xl md:text-2xl tracking-wide group-hover:text-primary transition-colors">
            Alpha Tech
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-10 border-none">
          <Link href="/" className={getLinkClass("/")}>
            Accueil
          </Link>
          <Link href="/a-propos" className={getLinkClass("/a-propos")}>
            À Propos
          </Link>
          <Link href="/masterclass" className={getLinkClass("/masterclass")}>
            Masterclass
          </Link>
          <Link href="/contact" className={getLinkClass("/contact")}>
            Contact
          </Link>
        </nav>
        <div className="hidden md:flex">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
          >
            Accès Privé
          </Link>
        </div>
        <button 
          className="md:hidden flex items-center justify-center w-[44px] h-[44px] relative z-50 text-ink focus:outline-none -mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <div className="w-6 flex flex-col gap-1.5 justify-center items-center">
            <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 origin-center ${isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} />
            <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-[100dvh] w-4/5 max-w-sm bg-bg border-l border-border z-40 flex flex-col transition-transform duration-300 ease-in-out px-8 pt-28 pb-8 overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="flex-1 flex flex-col">
          <nav className="flex flex-col gap-6 mt-4">
            <Link href="/" className={getLinkClass("/", true)} onClick={closeMobileMenu}>
              Accueil
            </Link>
            <Link href="/a-propos" className={getLinkClass("/a-propos", true)} onClick={closeMobileMenu}>
              À Propos
            </Link>
            <Link href="/masterclass" className={getLinkClass("/masterclass", true)} onClick={closeMobileMenu}>
              Masterclass
            </Link>
            <Link href="/contact" className={getLinkClass("/contact", true)} onClick={closeMobileMenu}>
              Contact
            </Link>
          </nav>
          
          <div className="mt-8">
            <Link
              href="/login"
              className="w-full text-center inline-flex items-center justify-center px-6 py-4 text-lg font-bold text-primary-foreground bg-primary rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all active:scale-95"
              onClick={closeMobileMenu}
            >
              Accès Privé
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col gap-6 shrink-0">
           <div className="flex justify-center gap-6">
              <a href="#" className="text-muted hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
              </a>
           </div>
           <div className="text-center text-sm text-muted">
             <p>contact@alphatech.com</p>
             <p className="mt-3 text-xs uppercase tracking-widest font-medium">
               <span className="text-ink">FR</span> <span className="mx-1 opacity-50">|</span> EN
             </p>
           </div>
        </div>
      </div>
    </header>
  );
};

