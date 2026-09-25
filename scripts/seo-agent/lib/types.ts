export interface Location {
  name: string;
  slug: string;
  fullTrust: boolean;
}

export interface Pillar {
  id: "sprzedaz" | "najem" | "zakup" | "rynek_lokalny";
  label: string;
  group: "sprzedaz-zakup" | "najem";
}

export interface Topic {
  city: string;
  pillar: Pillar;
  targetKeyword: string;
}

export interface GeneratedArticle {
  title: string;
  content: string;
  targetKeyword: string;
}

export interface GeneratedMeta {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}
