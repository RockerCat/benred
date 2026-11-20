import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SITE } from "@/lib/site";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "BenRed | Marketing experiencial, stands y eventos en Colombia",
    template: "%s | BenRed",
  },
  description:
    "BenRed diseña, produce y monta activaciones de marca, stands y eventos corporativos en Colombia. Cuéntanos tu proyecto.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "BenRed",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BenRed" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "./" },
};

export const viewport: Viewport = {
  themeColor: "#f3f0e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <noscript>
          <style>{`.reveal,.reveal-fade,.rg-item,.rw-i,.card-reveal,.card-tag{opacity:1!important;transform:none!important;clip-path:none!important}.rg-rule{transform:none!important}.hs .v3 .st{stroke-dashoffset:0!important}.hs .v3 .fl,.hs .v3 .tx,.hs .v3 .mt{opacity:1!important}.hs .v3 .st.wf{stroke-opacity:.5!important}.hs .v3 .pp{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
