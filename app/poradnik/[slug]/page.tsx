import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MapPin, ArrowLeft, Phone, Mail } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/constants";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { mdxComponents } from "@/mdx-components";
import { PILLAR_LABELS } from "@/lib/og-article";

interface ArticleDetailPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.frontmatter.slug }));
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return createMetadata("Artykuł nie znaleziony", "Szukany artykuł poradnika nie istnieje.", `/poradnik/${params.slug}`);
  }
  const base = createMetadata(post.frontmatter.title, post.frontmatter.description, `/poradnik/${params.slug}`);
  // Obrazek z app/poradnik/[slug]/opengraph-image.tsx podpina Next automatycznie — nadpisujemy
  // tylko typ na "article" z datą publikacji, żeby FB/LinkedIn i Google widziały artykuł.
  const { images: _images, ...openGraph } = base.openGraph ?? {};
  return {
    ...base,
    openGraph: {
      ...openGraph,
      type: "article",
      publishedTime: post.frontmatter.date,
      authors: [`Zespół ${COMPANY.name}`],
      section: post.frontmatter.pillar ? PILLAR_LABELS[post.frontmatter.pillar] : undefined,
    },
    twitter: { card: "summary_large_image", title: base.title as string, description: post.frontmatter.description },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const url = `${COMPANY.website}/poradnik/${frontmatter.slug}`;

  // Linkowanie wewnętrzne: najpierw ten sam filar, potem najnowsze.
  const related = getAllPosts()
    .filter((p) => p.frontmatter.slug !== frontmatter.slug)
    .sort((a, b) => Number(b.frontmatter.pillar === frontmatter.pillar) - Number(a.frontmatter.pillar === frontmatter.pillar))
    .slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: frontmatter.title,
      description: frontmatter.description,
      datePublished: frontmatter.date,
      dateModified: frontmatter.date,
      inLanguage: "pl-PL",
      mainEntityOfPage: url,
      url,
      image: `${url}/opengraph-image`,
      author: { "@type": "Organization", name: COMPANY.name, url: COMPANY.website },
      publisher: { "@type": "Organization", name: COMPANY.name, url: COMPANY.website },
      ...(frontmatter.city ? { about: { "@type": "Place", name: frontmatter.city } } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: COMPANY.website },
        { "@type": "ListItem", position: 2, name: "Poradnik", item: `${COMPANY.website}/poradnik` },
        { "@type": "ListItem", position: 3, name: frontmatter.title, item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

              <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
                {frontmatter.title}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
                {" · "}Zespół {COMPANY.name}
              </p>

              <div className="max-w-none">
                <MDXRemote source={content} components={mdxComponents} />
              </div>
            </div>

            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
                <h2 className="text-xl font-bold text-brand-navy mb-4">Zobacz też</h2>
                <ul className="space-y-3">
                  {related.map((p) => (
                    <li key={p.frontmatter.slug}>
                      <Link href={`/poradnik/${p.frontmatter.slug}`} className="text-brand-blue font-semibold hover:underline">
                        {p.frontmatter.title}
                      </Link>
                      <p className="text-sm text-gray-500">{p.frontmatter.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
