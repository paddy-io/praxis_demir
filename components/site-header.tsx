"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, ChevronDown, Stethoscope } from "lucide-react";
import { hauptLink, istAktiv, navGroups } from "./nav";

export function SiteHeader() {
  const pathname = usePathname();
  // Das offene Menü merkt sich den Pfad, auf dem es geöffnet wurde. Nach einem
  // Routenwechsel gilt es damit automatisch als geschlossen, ohne Effect.
  const [offen, setOffen] = useState<{ label: string; pfad: string } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Klick außerhalb oder Escape schließt das Menü.
  useEffect(() => {
    function onKlick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOffen(null);
      }
    }
    function onTaste(event: KeyboardEvent) {
      if (event.key === "Escape") setOffen(null);
    }
    document.addEventListener("mousedown", onKlick);
    document.addEventListener("keydown", onTaste);
    return () => {
      document.removeEventListener("mousedown", onKlick);
      document.removeEventListener("keydown", onTaste);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent text-white">
            <Stethoscope className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">
              Praxis Demir
            </span>
            <span className="hidden text-xs text-ink-muted sm:block">
              Allgemeinmedizin &middot; Berlin-Wedding
            </span>
          </span>
        </Link>

        <nav
          ref={navRef}
          className="hidden items-center gap-1 md:flex"
          aria-label="Hauptnavigation"
        >
          {navGroups.map((gruppe) => {
            const aktiv = gruppe.links.some((l) => istAktiv(pathname, l.href));
            const geoeffnet =
              offen?.label === gruppe.label && offen.pfad === pathname;
            return (
              <div key={gruppe.label} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOffen(geoeffnet ? null : { label: gruppe.label, pfad: pathname })
                  }
                  aria-expanded={geoeffnet}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-sm font-medium transition ${
                    aktiv
                      ? "bg-accent-soft text-accent"
                      : "text-ink-muted hover:bg-sand hover:text-ink"
                  }`}
                >
                  {gruppe.label}
                  <ChevronDown
                    className={`size-3.5 transition-transform ${geoeffnet ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {geoeffnet ? (
                  <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-card border border-line bg-surface p-1.5 shadow-lg">
                    {gruppe.links.map((link) => {
                      const linkAktiv = istAktiv(pathname, link.href);
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          aria-current={linkAktiv ? "page" : undefined}
                          className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${
                            linkAktiv ? "bg-accent-soft" : "hover:bg-sand"
                          }`}
                        >
                          <Icon
                            className={`mt-0.5 size-4 shrink-0 ${linkAktiv ? "text-accent" : "text-ink-muted"}`}
                            aria-hidden
                          />
                          <span>
                            <span
                              className={`block text-sm font-medium ${linkAktiv ? "text-accent" : "text-ink"}`}
                            >
                              {link.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-muted">
                              {link.beschreibung}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={hauptLink.href}
            className="inline-flex items-center gap-2 rounded-pill bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-strong"
          >
            <CalendarCheck className="size-4" aria-hidden />
            <span className="hidden sm:inline">{hauptLink.label}</span>
            <span className="sm:hidden">Buchen</span>
          </Link>
        </div>
      </div>

      {/* Mobile: kompakte horizontale Leiste mit allen Gruppen. */}
      <div className="border-t border-line md:hidden">
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2"
          aria-label="Hauptnavigation mobil"
        >
          {navGroups.flatMap((gruppe) => gruppe.links).map((link) => {
            const aktiv = istAktiv(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={aktiv ? "page" : undefined}
                className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-sm font-medium transition ${
                  aktiv ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-sand"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
