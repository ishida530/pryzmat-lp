import type { Metadata } from "next";
import { COMPANY } from "./constants";

export function createMetadata(
  title: string,
  description: string,
  path = ""
): Metadata {
  const url = `${COMPANY.website}${path}`;
  const fullTitle = `${title} | ${COMPANY.shortName}`;
  const ogImage = {
    url: `${COMPANY.website}/og-image.jpg`,
    width: 1200,
    height: 630,
    alt: `${title} — ${COMPANY.name}`,
  };
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: COMPANY.name,
      locale: "pl_PL",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${COMPANY.website}/og-image.jpg`],
    },
    alternates: {
      canonical: url,
    },
  };
}
