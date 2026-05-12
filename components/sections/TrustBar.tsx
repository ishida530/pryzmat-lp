"use client";
import { Shield, Calendar, CreditCard, MapPin } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { useInView } from "@/hooks/useInView";

const trustItems = [
  {
    Icon: Shield,
    label: "OC każdej transakcji",
    detail: "Każda transakcja ubezpieczona",
  },
  {
    Icon: Calendar,
    label: `${COMPANY.yearsActive} lat na rynku`,
    detail: `Doświadczenie od ${COMPANY.foundingYear} roku`,
  },
  {
    Icon: CreditCard,
    label: "Bezpłatna pomoc kredytowa",
    detail: "Pośrednictwo kredytowe gratis",
  },
  {
    Icon: MapPin,
    label: "Barczewo · Olsztyn i okolice",
    detail: "Znamy ten rynek jak własną kieszeń",
  },
];

export function TrustBar() {
  const { ref, inView } = useInView(0.2);

  return (
    <section
      ref={ref}
      className="bg-brand-light-blue border-b border-blue-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-blue-200">
          {trustItems.map(({ Icon, label, detail }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 lg:px-8 first:lg:pl-0 last:lg:pr-0 ${
                inView ? "animate-fade-up" : "opacity-0"
              }`}
              style={inView ? { animationDelay: `${i * 80}ms` } : undefined}
            >
              <div className="shrink-0 w-10 h-10 bg-brand-navy/10 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-navy" />
              </div>
              <div>
                <p className="font-bold text-brand-navy text-sm leading-tight">
                  {label}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
