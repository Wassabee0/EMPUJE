import Link from "next/link";
import { LogIn, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="topbar">
      <nav className="nav container" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">E</span>
          <span>Empuje</span>
        </Link>
        <div className="nav-links">
          <a href="/#how">Cómo funciona</a>
          <a href="/#trust">Confianza</a>
          <a href="/#money">Monetización</a>
        </div>
        <div className="nav-actions">
          <Link className="button secondary" href="/auth?next=/dashboard">
            <LogIn size={17} aria-hidden="true" />
            Entrar
          </Link>
          <Link className="button" href="/auth?mode=signup&next=/onboarding">
            <ShieldCheck size={17} aria-hidden="true" />
            Solicitar acceso beta
          </Link>
        </div>
      </nav>
    </header>
  );
}
