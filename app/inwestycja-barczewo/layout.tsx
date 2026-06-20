import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default function BarczewoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${playfair.variable} ${jetbrains.variable} overflow-x-hidden`}>
      {children}
    </div>
  );
}
