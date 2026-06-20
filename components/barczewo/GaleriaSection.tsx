"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

const IMAGES = [
  {
    src: "/images/barczewo-wizka-1.jpg",
    alt: "Widok od frontu — wjazd i wejście do garażu podziemnego",
    caption: "Widok od frontu",
    detail: "Wjazd, garaż podziemny, reprezentacyjne wejście główne",
  },
  {
    src: "/images/barczewo-wizka-2.jpg",
    alt: "Widok boczny — elewacja wschodnia",
    caption: "Elewacja boczna",
    detail: "Kompozycja fasady, loggie, układ okien 5 kondygnacji",
  },
  {
    src: "/images/barczewo-wizka-3.jpg",
    alt: "Widok od ogrodu — dziedziniec i zieleń",
    caption: "Dziedziniec i zieleń",
    detail: "Plac zabaw, teren biologicznie czynny, przestrzeń wspólna",
  },
];

export function GaleriaSection() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() =>
    setLightbox((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(() =>
    setLightbox((i) => (i !== null && i < IMAGES.length - 1 ? i + 1 : i)), []);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, close, prev, next]);

  return (
    <section
      id="wizualizacje"
      className="py-24 md:py-36"
      style={{ background: "#1a1a2e" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="b-section-label mb-4 flex items-center gap-3">
              <span className="b-gold-line" />
              Koncepcja architektoniczna
            </p>
            <h2
              className="font-playfair"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.875rem)", color: "#f9f7f3" }}
            >
              Wizualizacje 3D
            </h2>
          </div>
          <p
            className="text-sm max-w-xs text-right"
            style={{ color: "rgba(249,247,243,0.45)", lineHeight: "1.65" }}
          >
            Koncepcja gotowa — oszczędność czasu i kosztów projektowych dla
            inwestora
          </p>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="group relative overflow-hidden text-left focus:outline-none"
              style={{ aspectRatio: "4/3", borderRadius: "2px" }}
              aria-label={`Otwórz wizualizację: ${img.caption}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={80}
              />
              {/* Overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ background: "rgba(4,29,90,0.25)" }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "rgba(4,29,90,0.5)" }}
              />
              {/* Bottom caption */}
              <div
                className="absolute bottom-0 left-0 right-0 p-4"
                style={{
                  background:
                    "linear-gradient(to top, rgba(4,29,90,0.85) 0%, transparent 100%)",
                }}
              >
                <p
                  className="font-semibold text-sm"
                  style={{ color: "#f9f7f3" }}
                >
                  {img.caption}
                </p>
                <p
                  className="text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: "#9a7b3a" }}
                >
                  {img.detail}
                </p>
              </div>
              {/* Zoom icon */}
              <div
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "rgba(154,123,58,0.9)", borderRadius: "2px" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 1h4v4M5 13H1V9M13 9v4H9M1 5V1h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(4,29,90,0.97)" }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={IMAGES[lightbox].caption}
        >
          {/* Image container */}
          <div
            className="relative w-full max-w-5xl mx-4"
            style={{ aspectRatio: "16/10" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={IMAGES[lightbox].src}
              alt={IMAGES[lightbox].alt}
              fill
              className="object-contain"
              quality={95}
              sizes="90vw"
            />

            {/* Caption bar */}
            <div
              className="absolute bottom-0 left-0 right-0 px-6 py-4 text-center"
              style={{ background: "rgba(4,29,90,0.7)" }}
            >
              <p className="font-semibold text-sm" style={{ color: "#f9f7f3" }}>
                {IMAGES[lightbox].caption}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9a7b3a" }}>
                {IMAGES[lightbox].detail}
              </p>
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={close}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(249,247,243,0.2)", borderRadius: "2px", color: "#f9f7f3" }}
            aria-label="Zamknij"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ border: "1px solid rgba(249,247,243,0.2)", borderRadius: "2px", color: "#f9f7f3" }}
              aria-label="Poprzednie zdjęcie"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {lightbox < IMAGES.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ border: "1px solid rgba(249,247,243,0.2)", borderRadius: "2px", color: "#f9f7f3" }}
              aria-label="Następne zdjęcie"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className="transition-all duration-200"
                style={{
                  width: i === lightbox ? "1.5rem" : "0.375rem",
                  height: "0.375rem",
                  borderRadius: "9999px",
                  background: i === lightbox ? "#9a7b3a" : "rgba(249,247,243,0.3)",
                }}
                aria-label={`Wizualizacja ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
