import type { ComponentPropsWithoutRef } from "react";
import { PoradnikCTA } from "@/components/blog/PoradnikCTA";
import { PoradnikAuthorBio } from "@/components/blog/PoradnikAuthorBio";

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-2xl font-bold text-brand-navy mt-10 mb-4" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-xl font-bold text-brand-navy mt-8 mb-3" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="text-gray-700 leading-relaxed mb-5" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-5 space-y-2 mb-5 text-gray-700 leading-relaxed" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="text-brand-blue hover:underline" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-4 border-brand-blue bg-brand-light-blue rounded-r-lg px-5 py-4 my-6 text-brand-navy italic leading-relaxed" {...props} />
  ),
  PoradnikCTA,
  PoradnikAuthorBio,
};
