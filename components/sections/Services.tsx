"use client";
import {
  Home,
  KeyRound,
  Building2,
  Leaf,
  CreditCard,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";

interface Service {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  featured?: boolean;
  badge?: string;
  href?: string;
}

const services: Service[] = [
  {
    Icon: Home,
    title: "Sprzedaż nieruchomości",
    description:
      "Kompleksowa obsługa od wyceny, przez marketing i prezentacje, aż do finalizacji transakcji notarialnej.",
    href: "/oferty",
  },
  {
    Icon: KeyRound,
    title: "Wynajem mieszkań",
    description:
      "Skuteczne poszukiwanie najemców, weryfikacja kandydatów, umowy najmu chroniące interesy właściciela.",
    href: "/oferty",
  },
  {
    Icon: Building2,
    title: "Zarządzanie najmem",
    description:
      "Zarządzamy Twoim mieszkaniem jak swoim. Najemcy, płatności, naprawy — wszystko w naszych rękach.",
    featured: true,
    badge: "Stały przychód bez stresu",
    href: "/zarzadzanie-najmem",
  },
  {
    Icon: Leaf,
    title: "Działki i grunty",
    description:
      "Obrót działkami budowlanymi, rolnymi i inwestycyjnymi. Znajdziemy kupca lub idealną parcelę.",
    href: "/oferty",
  },
  {
    Icon: CreditCard,
    title: "Pomoc kredytowa (gratis)",
    description:
      "Bezpłatne pośrednictwo kredytowe. Porównamy oferty banków i pomożemy uzyskać najlepsze warunki.",
  },
  {
    Icon: FileText,
    title: "Obsługa dokumentów",
    description:
      "Przygotowanie umów przedwstępnych, ksiąg wieczystych, zaświadczeń i dokumentacji notarialnej.",
  },
];

export function Services() {
  const { ref, inView } = useInView(0.08);

  return (
    <section ref={ref} id="uslugi" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          className={`text-center mb-14 ${inView ? "animate-fade-up" : "opacity-0"}`}
          style={inView ? { animationDelay: "0ms" } : undefined}
        >
          <p className="section-label mb-3">NASZE USŁUGI</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
            Co możemy dla Ciebie zrobić
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base">
            Oferujemy pełen zakres usług nieruchomościowych — od wyceny po
            klucze do nowego domu.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(
            ({ Icon, title, description, featured, badge, href }, index) => {
              const card = (
                <div
                  className={`relative bg-white rounded-xl p-6 border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group ${
                    featured
                      ? "border-brand-red shadow-md ring-1 ring-brand-red/20"
                      : "border-gray-100 shadow-sm"
                  } ${inView ? "animate-fade-up" : "opacity-0"}`}
                  style={
                    inView
                      ? { animationDelay: `${index * 75 + 100}ms` }
                      : undefined
                  }
                >
                  {badge && (
                    <span className="absolute -top-3 left-5 bg-brand-red text-white text-[11px] font-bold px-3 py-1 rounded-full">
                      {badge}
                    </span>
                  )}

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 ${
                      featured ? "bg-brand-red/10" : "bg-brand-light-blue"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        featured ? "text-brand-red" : "text-brand-navy"
                      }`}
                    />
                  </div>

                  <h3 className="font-bold text-brand-navy text-base mb-2 group-hover:text-brand-blue transition-colors">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {description}
                  </p>

                  {href && (
                    <p
                      className={`text-sm font-semibold mt-4 ${
                        featured ? "text-brand-red" : "text-brand-blue"
                      }`}
                    >
                      Dowiedz się więcej →
                    </p>
                  )}
                </div>
              );

              return href ? (
                <Link key={title} href={href} className="block">
                  {card}
                </Link>
              ) : (
                <div key={title}>{card}</div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
