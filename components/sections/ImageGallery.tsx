"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

const normalUrl  = (id: number) => `https://img.asariweb.pl/normal/${id}`;
const thumbUrl   = (id: number) => `https://img.asariweb.pl/thumbnail/${id}`;

interface Props {
  photoIds: number[];
  alt: string;
}

export function ImageGallery({ photoIds, alt }: Props) {
  const [current, setCurrent] = useState(0);

  if (photoIds.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg mb-8 h-[480px] bg-gradient-to-br from-brand-navy/10 to-brand-blue/10 flex items-center justify-center">
        <Home className="w-20 h-20 text-brand-navy/20" />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + photoIds.length) % photoIds.length);
  const next = () => setCurrent((c) => (c + 1) % photoIds.length);

  return (
    <div className="mb-8">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg h-[480px]">
        <Image
          src={normalUrl(photoIds[current])}
          alt={`${alt} — zdjęcie ${current + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/20 via-transparent to-brand-navy/10 pointer-events-none" />

        {photoIds.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-2 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Następne zdjęcie"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-2 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full z-10">
              {current + 1} / {photoIds.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photoIds.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {photoIds.map((id, i) => (
            <button
              key={id}
              onClick={() => setCurrent(i)}
              aria-label={`Zdjęcie ${i + 1}`}
              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === current
                  ? "border-brand-blue opacity-100"
                  : "border-transparent opacity-55 hover:opacity-100"
              }`}
            >
              <img
                src={thumbUrl(id)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
