import { COMPANY } from "@/lib/constants";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { OG_SIZE, renderArticleOg } from "@/lib/og-article";

// Obrazek OG strony artykułu (tytuł + miasto). Runtime nodejs — artykuły czytamy z dysku.
export const alt = `Poradnik — ${COMPANY.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.frontmatter.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  return renderArticleOg({
    title: post?.frontmatter.title ?? "Poradnik nieruchomości",
    pillar: post?.frontmatter.pillar,
    city: post?.frontmatter.city,
  });
}
