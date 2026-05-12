"use client";
// FAZA 4: Pull from Google Reviews API
import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    name: "Anna K.",
    location: "Olsztyn",
    rating: 5,
    text: "Sprzedaż mieszkania z PRYZMAT to była czysta przyjemność. Jerzy od razu ocenił realną wartość nieruchomości, znalazł kupca w 3 tygodnie. Polecam z całego serca!",
    context: "Sprzedaż mieszkania",
  },
  {
    name: "Marek i Ewa W.",
    location: "Barczewo",
    rating: 5,
    text: "Szukaliśmy domu w okolicach Barczewa prawie rok — z innymi biurami. Z PRYZMAT znaleźliśmy ideał w ciągu miesiąca. Pełna obsługa kredytowa w pakiecie, gratis. Rewelacja.",
    context: "Kupno domu",
  },
  {
    name: "Piotr S.",
    location: "Olsztyn",
    rating: 5,
    text: "Mam dwa mieszkania pod zarządzaniem PRYZMAT. Nie martwię się o nic — przelew wpada regularnie, a wszelkie sprawy z najemcami biuro załatwia samo. Polecam właścicielom.",
    context: "Zarządzanie najmem",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} gwiazdki`}>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? "text-yellow-400" : "text-gray-200"} fill-current`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          className={`text-center mb-14 ${inView ? "animate-fade-up" : "opacity-0"}`}
          style={inView ? { animationDelay: "0ms" } : undefined}
        >
          <p className="section-label mb-3">OPINIE KLIENTÓW</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
            Co mówią nasi klienci
          </h2>
          {/* FAZA 4: Show live Google Reviews rating here */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, location, rating, text, context }, i) => (
            <div
              key={name}
              className={`bg-brand-light-blue rounded-2xl p-7 border border-blue-100 relative ${inView ? "animate-fade-up" : "opacity-0"}`}
              style={inView ? { animationDelay: `${i * 120 + 100}ms` } : undefined}
            >
              {/* Quote mark */}
              <div className="absolute top-5 right-6 text-brand-blue/20 text-7xl font-serif leading-none select-none">
                &ldquo;
              </div>

              <StarRating count={rating} />

              <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6 relative">
                {text}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-brand-navy text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{location}</p>
                </div>
                <span className="text-[10px] font-semibold text-brand-red bg-brand-red/10 px-2.5 py-1 rounded-full">
                  {context}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
