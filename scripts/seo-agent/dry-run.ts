// Próbny przebieg pipeline'u treści (research → artykuł → fact-check) BEZ GitHuba — do lokalnego
// sprawdzenia jakości przed uruchomieniem prawdziwego agenta. Użycie: npm run seo-agent:dry-run
import fs from "node:fs";
import { LOCATIONS, PILLARS } from "./config";
import { factCheckArticle, generateArticle, researchFacts, reviseArticle } from "./lib/claude-client";

async function run(): Promise<void> {
  const location = LOCATIONS[0];
  const topic = { city: location.name, pillar: PILLARS[0], targetKeyword: `sprzedaż mieszkania ${location.name}` };

  console.log(`[dry-run] Temat: ${topic.targetKeyword}`);
  const facts = await researchFacts(topic, location);
  console.log(`[dry-run] Fakty (${facts.length}):`);
  facts.forEach((f) => console.log(`  - ${f.claim}\n    ${f.sourceUrl}`));

  let article = await generateArticle(topic, location, facts, [
    { title: "Aktualne oferty nieruchomości", path: "/oferty" },
    { title: "Zarządzanie najmem", path: "/zarzadzanie-najmem" },
    { title: "Bezpłatna konsultacja i kontakt", path: "/kontakt" },
  ]);
  let issues = await factCheckArticle(article.content, facts);
  console.log(`[dry-run] Fact-check #1: ${issues.length} uwag (${issues.filter((i) => i.severity === "blocker").length} blokerów)`);
  issues.forEach((i) => console.log(`  [${i.severity}] ${i.problem} — "${i.excerpt.slice(0, 100)}"`));

  if (issues.some((i) => i.severity === "blocker")) {
    article = await reviseArticle(article, issues, facts);
    issues = await factCheckArticle(article.content, facts);
    console.log(`[dry-run] Fact-check #2: ${issues.length} uwag (${issues.filter((i) => i.severity === "blocker").length} blokerów)`);
    issues.forEach((i) => console.log(`  [${i.severity}] ${i.problem} — "${i.excerpt.slice(0, 100)}"`));
  }

  fs.writeFileSync("seo-agent-dry-run.md", article.content);
  console.log("[dry-run] Artykuł zapisany do seo-agent-dry-run.md");
}

run().catch((err) => {
  console.error("[dry-run] Błąd:", err);
  process.exit(1);
});
