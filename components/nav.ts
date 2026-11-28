import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  ClipboardList,
  FileText,
  Phone,
  ShieldAlert,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  beschreibung: string;
};

export type NavGroup = {
  label: string;
  links: NavLink[];
};

// Direkt erreichbare Hauptaktion (auch der CTA).
export const hauptLink: NavLink = {
  href: "/buchen",
  label: "Termin buchen",
  icon: CalendarCheck,
  beschreibung: "Selbst einen freien Termin wählen und verbindlich buchen.",
};

// Die übrigen Seiten sind nach Aufgaben gruppiert, damit die Kopfzeile ruhig
// bleibt. Reihenfolge: erst der Praxisalltag, dann Formulare und Verwaltung.
export const navGroups: NavGroup[] = [
  {
    label: "Praxisalltag",
    links: [
      {
        href: "/plan",
        label: "Terminplan",
        icon: CalendarClock,
        beschreibung: "Slots und Terminarten pflegen.",
      },
      {
        href: "/termine",
        label: "Termine",
        icon: ClipboardList,
        beschreibung: "Termine an Telefon und Tresen verwalten.",
      },
      {
        href: "/abwesenheit",
        label: "Abwesenheit",
        icon: CalendarOff,
        beschreibung: "Urlaub und Schließungen eintragen.",
      },
      {
        href: "/noshow",
        label: "No-Show",
        icon: ShieldAlert,
        beschreibung: "No-Shows zählen und Online-Sperre setzen.",
      },
    ],
  },
  {
    label: "Formulare",
    links: [
      {
        href: "/rezepte",
        label: "Rezepte",
        icon: FileText,
        beschreibung: "Rezeptanträge anlegen und freigeben.",
      },
      {
        href: "/erstgespraech",
        label: "Erstgespräch",
        icon: Phone,
        beschreibung: "Telefonisch vorklären und Termin vergeben.",
      },
      {
        href: "/einwilligungen",
        label: "Einwilligungen",
        icon: BellRing,
        beschreibung: "Opt-in für SMS und E-Mail verwalten.",
      },
    ],
  },
];

export function istAktiv(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
