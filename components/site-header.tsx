"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Stethoscope } from "lucide-react";

const nav = [
  { href: "/", label: "Start" },
  { href: "/buchen", label: "Termin buchen" },
  { href: "/plan", label: "Terminplan" },
  { href: "/termine", label: "Termine" },
  { href: "/rezepte", label: "Rezepte" },
  { href: "/abwesenheit", label: "Abwesenheit" },
  { href: "/noshow", label: "No-Show" },
  { href: "/einwilligungen", label: "Einwilligungen" },
];

export function SiteHeader() {
  const pathname = usePathname();

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
            <span className="block text-xs text-ink-muted">
              Allgemeinmedizin &middot; Berlin-Wedding
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => {
            const aktiv =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={`rounded-pill px-3.5 py-2 text-sm font-medium transition ${
                  aktiv
                    ? "bg-accent-soft text-accent"
                    : "text-ink-muted hover:bg-sand hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/buchen"
          className="inline-flex items-center gap-2 rounded-pill bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-strong"
        >
          <CalendarCheck className="size-4" aria-hidden />
          <span className="hidden sm:inline">Termin buchen</span>
          <span className="sm:hidden">Buchen</span>
        </Link>
      </div>
    </header>
  );
}
