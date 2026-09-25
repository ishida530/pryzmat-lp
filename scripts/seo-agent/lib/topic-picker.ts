// Dedup na podstawie plików content/blog/*.mdx (git), nie Supabase — od migracji na wzorzec
// code94 (2026-09-23) publikacja artykułu to plik na branchu głównym, nie wiersz w bazie, więc
// baza artykułów przestała być źródłem prawdy o tym, co już opublikowano. GitHub Actions robi
// pełny `actions/checkout` przed uruchomieniem tego skryptu, więc content/blog/ jest tu zawsze
// aktualne względem brancha main w momencie odpalenia crona.
import { getAllPosts } from "../../../lib/blog";
import { DEDUP_WINDOW_DAYS, LOCATIONS, PILLARS } from "../config";
import { Pillar, Topic } from "./types";

const GROUPS: Pillar["group"][] = ["sprzedaz-zakup", "najem"];

function pillarsInGroup(group: Pillar["group"]): Pillar[] {
  return PILLARS.filter((p) => p.group === group);
}

function buildTargetKeyword(pillar: Pillar, city: string): string {
  return `${pillar.label} ${city}`;
}

// Deterministyczna sekwencja round-robin: parzyste pozycje → grupa "sprzedaz-zakup",
// nieparzyste → grupa "najem" (naprzemiennie 50/50). Wewnątrz grupy filary i miasta
// cyklują niezależnie, więc kolejne wywołania nie powtarzają tej samej pary zanim
// nie przejdą przez wszystkie kombinacje.
function candidateAt(n: number): { city: string; pillar: Pillar } {
  const group = GROUPS[n % GROUPS.length];
  const groupPillars = pillarsInGroup(group);
  const pillar = groupPillars[Math.floor(n / GROUPS.length) % groupPillars.length];
  const cityIndex = Math.floor(n / (GROUPS.length * groupPillars.length)) % LOCATIONS.length;
  const city = LOCATIONS[cityIndex].name;
  return { city, pillar };
}

export async function pickNextTopic(): Promise<Topic> {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - DEDUP_WINDOW_DAYS);

  const posts = getAllPosts();

  const excluded = new Set(
    posts
      .filter((post) => post.frontmatter.city && post.frontmatter.pillar && new Date(post.frontmatter.date) >= windowStart)
      .map((post) => `${post.frontmatter.city}|${post.frontmatter.pillar}`)
  );

  const total = posts.length;
  const maxSlots = LOCATIONS.length * PILLARS.length;

  for (let offset = 0; offset < maxSlots; offset++) {
    const { city, pillar } = candidateAt(total + offset);
    if (!excluded.has(`${city}|${pillar.id}`)) {
      return { city, pillar, targetKeyword: buildTargetKeyword(pillar, city) };
    }
  }

  // Pełny cykl: wszystkie pary (city, pillar) użyte w ostatnich 90 dniach.
  // Zresetuj wykluczenia i weź pierwszą kandydaturę w kolejności round-robin —
  // nie blokuj rundy.
  const { city, pillar } = candidateAt(total);
  return { city, pillar, targetKeyword: buildTargetKeyword(pillar, city) };
}
