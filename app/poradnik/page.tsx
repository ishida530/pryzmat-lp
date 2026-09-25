import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BookOpen } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = createMetadata(
  "Poradnik nieruchomości",
  "Praktyczne artykuły o sprzedaży, zakupie i najmie nieruchomości w Barczewie, Olsztynie i okolicach — wycena, formalności, podatki, obowiązki wynajmującego.",
  "/poradnik"
);

const PILLAR_LABELS: Record<string, string> = {
  sprzedaz: "Sprzedaż",
  najem: "Najem",
  zakup: "Zakup",
  rynek_lokalny: "Rynek lokalny",
};

function ArticlesList() {
  const posts = getAllPosts();

  if (posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-lg font-semibold text-brand-navy">
          Wkrótce pojawią się tu pierwsze artykuły poradnika.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(({ frontmatter }) => (
          <Link
            key={frontmatter.slug}
            href={`/poradnik/${frontmatter.slug}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden group flex flex-col"
          >
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3">
                {frontmatter.pillar && (
                  <span className="bg-brand-navy text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {PILLAR_LABELS[frontmatter.pillar] ?? frontmatter.pillar}
                  </span>
                )}
                {frontmatter.city && (
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    {frontmatter.city}
                  </span>
                )}
              </div>
              <h2 className="font-bold text-brand-navy text-lg leading-snug mb-2 group-hover:text-brand-blue transition-colors">
                {frontmatter.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                {frontmatter.description}
              </p>
              <span className="mt-4 text-brand-blue text-xs font-semibold">
                Czytaj więcej →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function PoradnikPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header */}
      <div className="relative overflow-hidden py-14 lg:py-20">
        <Image
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1920&q=80"
          alt="Poradnik nieruchomości"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-dark-navy/90" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(46,110,197,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            PORADNIK
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
            Poradnik <span className="text-blue-300">nieruchomości</span>
          </h1>
          <p className="text-gray-300 mt-3 text-base">
            Sprzedaż · Zakup · Najem · Rynek lokalny — Barczewo, Olsztyn i okolice
          </p>
        </div>
      </div>

      <ArticlesList />

    </div>
  );
}
