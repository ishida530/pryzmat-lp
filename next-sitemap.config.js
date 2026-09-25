/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.pryzmatnieruchomosci.pl",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
    ],
  },
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/api/*", "/polityka-prywatnosci", "/rodo"],
  additionalPaths: async (config) => {
    const paths = [
      await config.transform(config, "/oferty"),
      await config.transform(config, "/zespol"),
      await config.transform(config, "/poradnik"),
    ];

    // Dociągnij opublikowane artykuły poradnika. Od migracji na wzorzec code94
    // (2026-09-23) "opublikowany" = plik .mdx obecny na branchu main w momencie builda —
    // to samo repo, więc wystarczy odczyt z dysku, bez Supabase/sieci. `next-sitemap`
    // uruchamia ten config przez zwykły `node` (postbuild), stąd `gray-matter` przez
    // require (CJS), nie import z lib/blog.ts (TS + ESM).
    try {
      const fs = require("fs");
      const path = require("path");
      const matter = require("gray-matter");
      const blogDir = path.join(process.cwd(), "content", "blog");
      if (fs.existsSync(blogDir)) {
        const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));
        for (const file of files) {
          const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
          const { data } = matter(raw);
          if (data.slug) {
            const entry = await config.transform(config, `/poradnik/${data.slug}`);
            // lastmod = data publikacji artykułu, nie czas builda — rzetelny sygnał świeżości dla Google.
            if (data.date) entry.lastmod = new Date(data.date).toISOString();
            paths.push(entry);
          }
        }
      }
    } catch (error) {
      console.warn("[next-sitemap] Nie udało się pobrać slugów artykułów:", error.message);
    }

    return paths;
  },
  transform: async (config, path) => {
    const priorities = {
      "/": 1.0,
      "/oferty": 0.9,
      "/zarzadzanie-najmem": 0.9,
      "/kontakt": 0.8,
      "/o-nas": 0.7,
      "/poradnik": 0.7,
      "/zespol": 0.6,
    };
    return {
      loc: path,
      changefreq: path === "/" || path === "/oferty" ? "daily" : "weekly",
      priority: priorities[path] ?? 0.6,
      lastmod: new Date().toISOString(),
    };
  },
};
