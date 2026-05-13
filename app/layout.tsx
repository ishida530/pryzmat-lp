import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";
import { COMPANY } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.website),
  title: {
    default: `Biuro Nieruchomości Barczewo i Olsztyn | ${COMPANY.shortName}`,
    template: `%s | ${COMPANY.shortName}`,
  },
  description:
    "Biuro nieruchomości PRYZMAT — sprzedaż, wynajem i zarządzanie w Barczewie, Olsztynie i powiecie olsztyńskim. 13 lat doświadczenia.",
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "geo.region": "PL-WN",
    "geo.placename": "Barczewo, warmińsko-mazurskie",
    "geo.position": "53.8267;20.6898",
    ICBM: "53.8267, 20.6898",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
