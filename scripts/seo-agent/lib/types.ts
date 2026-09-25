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

export interface SourcedFact {
  claim: string;
  sourceUrl: string;
  sourceTitle: string;
  // Dosłowny fragment ze źródła potwierdzający claim — do ręcznej weryfikacji w PR.
  quote: string;
}

export interface ReviewIssue {
  excerpt: string;
  problem: string;
  severity: "blocker" | "minor";
  fix: string;
}

export interface FactCheckReport {
  issues: ReviewIssue[];
}

export interface GeneratedMeta {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}
