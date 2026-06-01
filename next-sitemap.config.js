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
  additionalPaths: async (config) => [
    await config.transform(config, "/oferty"),
    await config.transform(config, "/zespol"),
  ],
  transform: async (config, path) => {
    const priorities = {
      "/": 1.0,
      "/oferty": 0.9,
      "/zarzadzanie-najmem": 0.9,
      "/kontakt": 0.8,
      "/o-nas": 0.7,
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
