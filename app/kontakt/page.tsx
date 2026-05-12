import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { ContactPageForm } from "@/components/forms/ContactPageForm";

export const metadata: Metadata = createMetadata(
  "Kontakt — biuro nieruchomości Barczewo",
  "Skontaktuj się z biurem nieruchomości PRYZMAT w Barczewie. Telefon, e-mail, formularz kontaktowy. Bezpłatna wycena nieruchomości.",
  "/kontakt"
);

export default function KontaktPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            KONTAKT
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-3">
            Skontaktuj się z nami
          </h1>
          <p className="text-gray-300 text-lg">
            Odpiszemy lub oddzwonimy w ciągu 2 godzin w godzinach pracy biura.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactPageForm />
        </div>
      </section>
    </div>
  );
}
