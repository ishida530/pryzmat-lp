import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MapPin, ArrowLeft, Phone, Mail } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/constants";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { mdxComponents } from "@/mdx-components";

interface ArticleDetailPageProps {
  params: { slug: string };
}

const PILLAR_LABELS: Record<string, string> = {
  sprzedaz: "Sprzedaż",
  najem: "Najem",
  zakup: "Zakup",
  rynek_lokalny: "Rynek lokalny",
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.frontmatter.slug }));
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return createMetadata("Artykuł nie znaleziony", "Szukany artykuł poradnika nie istnieje.", `/poradnik/${params.slug}`);
  }
  return createMetadata(post.frontmatter.title, post.frontmatter.description, `/poradnik/${params.slug}`);
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const { frontmatter, content } = post;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/poradnik" className="text-brand-blue hover:underline">
              Poradnik
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate">{frontmatter.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column — article */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
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

              <h1 className="text-3xl font-extrabold text-brand-navy mb-6">
                {frontmatter.title}
              </h1>

              <div className="max-w-none">
                <MDXRemote source={content} components={mdxComponents} />
              </div>
            </div>

            <div className="text-center lg:text-left">
              <Link
                href="/poradnik"
                className="inline-flex items-center gap-2 text-brand-blue hover:underline font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Wróć do poradnika
              </Link>
            </div>
          </div>

          {/* Right column — contact CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-brand-navy mb-2">
                  Potrzebujesz pomocy?
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Skontaktuj się z nami — pomożemy w sprzedaży, zakupie lub najmie
                  nieruchomości{frontmatter.city ? ` w ${frontmatter.city} i okolicy` : ""}.
                </p>

                <div className="space-y-3 mb-8">
                  <a
                    href={`tel:${COMPANY.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Zadzwoń
                  </a>
                  <a
                    href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Zapytanie z poradnika: " + frontmatter.title)}`}
                    className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </a>
                  <Link
                    href="/oferty"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-brand-navy px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Zobacz oferty
                  </Link>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {COMPANY.name.toUpperCase()}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {COMPANY.address.street}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    {COMPANY.address.postalCode} {COMPANY.address.city}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Tel:</span> {COMPANY.phoneDisplay}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Email:</span> {COMPANY.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
