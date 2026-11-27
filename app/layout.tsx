import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Terminbuchung Praxis Demir & Kollegen",
  description: "Online-Terminbuchung für die Praxis Demir & Kollegen, Berlin-Wedding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${fraunces.variable}`}>
      {/* suppressHydrationWarning: Browser-Erweiterungen (z. B. Grammarly) setzen
          eigene Attribute ins <body>, bevor React übernimmt. Das ist kein Fehler
          der App; die Warnung wird hier bewusst nur für dieses Element stumm gestellt. */}
      <body suppressHydrationWarning className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
