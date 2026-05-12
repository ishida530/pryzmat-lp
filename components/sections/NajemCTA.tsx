import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Szukamy i weryfikujemy najemców",
  "Pilnujemy płatności czynszu co miesiąc",
  "Reagujemy na awarie w Twoim imieniu",
  "Rozliczamy media i opłaty administracyjne",
];

export function NajemCTA() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background property photo — REPLACE with actual photo */}
      <Image
        src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1920&q=80"
        alt="Mieszkanie do wynajęcia w Olsztynie"
        fill
        className="object-cover"
        sizes="100vw"
      />
      {/* Dark navy overlay */}
      <div className="absolute inset-0 bg-brand-dark-navy/95" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">

          {/* Text block */}
          <div className="max-w-2xl border-l-4 border-brand-red pl-7 lg:pl-10">
            <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-4">
              DLA WŁAŚCICIELI MIESZKAŃ
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-5">
              Masz mieszkanie do wynajęcia?{" "}
              <span className="text-blue-300">Zajmiemy się wszystkim.</span>
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Zarządzamy najmem w Twoim imieniu — szukamy najemców, pilnujemy
              płatności, reagujemy na awarie.{" "}
              <strong className="text-white">
                Ty dostajesz przelew co miesiąc.
              </strong>
            </p>
            <ul className="space-y-2.5 mb-8">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA card */}
          <div className="lg:shrink-0">
            <div className="bg-brand-navy/80 border border-white/20 rounded-2xl p-8 text-center max-w-xs backdrop-blur-sm">
              <p className="text-white font-bold text-lg mb-2">
                Bezpłatna konsultacja
              </p>
              <p className="text-gray-300 text-sm mb-6">
                Dowiedz się, ile możesz zarabiać na swoim mieszkaniu.
              </p>
              <Link
                href="/zarzadzanie-najmem"
                className="inline-flex items-center gap-2 bg-brand-navy text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors"
              >
                Dowiedz się więcej
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
