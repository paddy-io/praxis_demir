import Link from "next/link";
import { Clock, MapPin, Phone, Stethoscope } from "lucide-react";
import { hauptLink, navGroups } from "./nav";

export function SiteFooter() {
  const alleLinks = navGroups.flatMap((gruppe) => gruppe.links);

  return (
    <footer className="mt-24 border-t border-line bg-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-white">
              <Stethoscope className="size-5" aria-hidden />
            </span>
            <span className="font-display text-base font-semibold">
              Praxis Demir &amp; Kollegen
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            Gemeinschaftspraxis für Allgemeinmedizin in Berlin-Wedding.
            Online-Terminbuchung für Bestandspatient:innen.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            Navigation
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="text-ink transition hover:text-accent">
                Start
              </Link>
            </li>
            <li>
              <Link
                href={hauptLink.href}
                className="text-ink transition hover:text-accent"
              >
                {hauptLink.label}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            Für die Praxis
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {alleLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink transition hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            Kontakt
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>Berlin-Wedding</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>Telefon für Akut und Erstgespräch</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>Akut, Blutabnahme und Erstgespräch nur telefonisch</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Praxis Demir &amp; Kollegen. Ein
          Studienprojekt, keine echte Praxis.
        </p>
      </div>
    </footer>
  );
}
