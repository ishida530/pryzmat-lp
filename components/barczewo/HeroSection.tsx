"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function AnimatedStat({
  target,
  suffix = "",
  duration = 1800,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString("pl-PL")}
      {suffix}
    </span>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#0f2444" }}
    >
      {/* Background visualization */}
      <div className="absolute inset-0 select-none pointer-events-none">
        <Image
          src="/images/barczewo-wizka-2.jpg"
          alt="Wizualizacja budynku wielorodzinnego — Barczewo"
          fill
          className="object-cover"
          style={{ opacity: 0.22 }}
          priority
          quality={85}
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, rgba(15,36,68,0.97) 0%, rgba(27,58,107,0.75) 55%, rgba(15,36,68,0.92) 100%)",
          }}
        />
      </div>

      {/* Left gold accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 hidden lg:block"
        style={{
          width: "3px",
          background:
            "linear-gradient(to bottom, transparent, #9a7b3a 20%, #9a7b3a 80%, transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 lg:px-16 py-28 md:py-36">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <p className="b-section-label mb-8 flex items-center gap-3">
            <span
              className="inline-block w-8 h-px"
              style={{ background: "#9a7b3a" }}
            />
            Oferta dla inwestorów prywatnych · Barczewo · Jedno miejsce dostępne
          </p>

          {/* Headline */}
          <h1
            className="font-playfair text-balance leading-[1.05] mb-6"
            style={{
              fontSize: "clamp(2.75rem, 6.5vw, 5rem)",
              color: "#f9f7f3",
            }}
          >
            Wnosisz kapitał.
            <br />
            <span style={{ color: "#ffffff" }}>
              Jerzy Sawczuk koordynuje resztę.
            </span>
          </h1>

          {/* Body */}
          <p
            className="text-lg md:text-xl leading-relaxed mb-14 max-w-xl"
            style={{ color: "rgba(249,247,243,0.6)", lineHeight: "1.7" }}
          >
            Gotowa działka z pozwoleniem planistycznym, koncepcja architektoniczna
            na 80 mieszkań i człowiek który zna lokalnych wykonawców od 11 lat
            i sprzeda każdy lokal bez żadnych kosztów po Twojej stronie.
            Twoja rola: decyzja finansowa i odbiór zysku.
          </p>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-6 md:gap-10 pt-8 mb-14"
            style={{ borderTop: "1px solid rgba(154,123,58,0.35)" }}
          >
            {/* Stat 1 — animowany */}
            <div className="flex flex-col gap-1">
              <span
                className="font-jetbrains font-bold leading-none"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "#f9f7f3" }}
              >
                <AnimatedStat target={4438} suffix=" m²" />
              </span>
              <span
                className="font-sans font-medium tracking-widest uppercase"
                style={{ fontSize: "0.6rem", color: "#9a7b3a", letterSpacing: "0.18em" }}
              >
                powierzchnia działki
              </span>
            </div>

            {/* Stat 2 — animowany */}
            <div className="flex flex-col gap-1">
              <span
                className="font-jetbrains font-bold leading-none"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "#f9f7f3" }}
              >
                <AnimatedStat target={80} />
              </span>
              <span
                className="font-sans font-medium tracking-widest uppercase"
                style={{ fontSize: "0.6rem", color: "#9a7b3a", letterSpacing: "0.18em" }}
              >
                mieszkań w koncepcji
              </span>
            </div>

            {/* Stat 3 — statyczny */}
            <div className="flex flex-col gap-1">
              <span
                className="font-jetbrains font-bold leading-none"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "#f9f7f3" }}
              >
                1,7 mln zł
              </span>
              <span
                className="font-sans font-medium tracking-widest uppercase"
                style={{ fontSize: "0.6rem", color: "#9a7b3a", letterSpacing: "0.18em" }}
              >
                cena działki
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-sm tracking-wide transition-opacity duration-200 hover:opacity-90 active:opacity-80"
              style={{
                background: "#C0392B",
                color: "#fff",
                borderRadius: "2px",
                letterSpacing: "0.04em",
              }}
            >
              Umów rozmowę z Jerzym
            </a>
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-sm tracking-wide transition-colors duration-200 hover:bg-white/10"
              style={{
                border: "1px solid rgba(249,247,243,0.25)",
                color: "#f9f7f3",
                borderRadius: "2px",
                letterSpacing: "0.04em",
              }}
            >
              Pobierz dokumentację
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 0.35 }}
        aria-hidden="true"
      >
        <div
          className="w-px animate-pulse"
          style={{ height: "3rem", background: "#9a7b3a" }}
        />
      </div>
    </section>
  );
}
