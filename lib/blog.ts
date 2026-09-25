// Warstwa danych bloga/poradnika — czyta content/blog/*.mdx bezpośrednio z dysku (git), zamiast
// Supabase (dawne lib/articles-db.ts). Wzorowane 1:1 na code94's lib/blog.ts (ten sam właściciel,
// ten sam wzorzec publikacji: plik na branchu domyślnym = opublikowany). Rozszerzone o opcjonalne
// city/pillar/targetKeyword — specyficzne dla SEO-agenta tego projektu (dedup tematów w
// scripts/seo-agent/lib/topic-picker.ts), których code94 nie potrzebuje.
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  slug: string;
  city?: string;
  pillar?: "sprzedaz" | "najem" | "zakup" | "rynek_lokalny";
  targetKeyword?: string;
};

export type BlogPost = {
  frontmatter: BlogFrontmatter;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function readPostFile(filename: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data as BlogFrontmatter, content };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map(readPostFile).sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  return getAllPosts().find((p) => p.frontmatter.slug === slug) ?? null;
}
