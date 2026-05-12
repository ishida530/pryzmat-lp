import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = createMetadata(
  "Polityka prywatności",
  "Polityka prywatności Biura Nieruchomości PRYZMAT. Informacje o przetwarzaniu danych osobowych zgodnie z RODO.",
  "/polityka-prywatnosci"
);

export default function PolitykaPrywatnosci() {
  return (
    <div>
      <section className="bg-brand-navy py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            DOKUMENTY PRAWNE
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
            Polityka prywatności
          </h1>
          <p className="text-gray-300 mt-3">
            Ostatnia aktualizacja: styczeń 2025
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">
            1. Administrator danych
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Administratorem Twoich danych osobowych jest{" "}
            <strong>{COMPANY.name}</strong>, z siedzibą pod adresem{" "}
            {COMPANY.address.full}. Kontakt:{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-blue hover:underline">
              {COMPANY.email}
            </a>
            ,{" "}
            <a href={`tel:${COMPANY.phone}`} className="text-brand-blue hover:underline">
              {COMPANY.phoneDisplay}
            </a>
            .
          </p>

          <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">
            2. Jakie dane zbieramy
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Za pośrednictwem formularzy kontaktowych zbieramy: imię, numer
            telefonu oraz opcjonalnie adres e-mail i treść wiadomości. Dane
            podane są dobrowolnie i służą wyłącznie do odpowiedzi na Twoje
            zapytanie.
          </p>

          <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">
            3. Cel i podstawa przetwarzania
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Twoje dane przetwarzamy w celu odpowiedzi na zapytanie (art. 6 ust.
            1 lit. b RODO — wykonanie umowy / podjęcie działań na żądanie osoby)
            oraz w celach marketingowych na podstawie zgody (art. 6 ust. 1 lit.
            a RODO).
          </p>

          <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">
            4. Okres przechowywania danych
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Dane przechowujemy przez okres niezbędny do realizacji usługi,
            maksymalnie 3 lata od ostatniego kontaktu, chyba że obowiązek
            prawny wymaga dłuższego okresu przechowywania.
          </p>

          <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">
            5. Twoje prawa
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Przysługuje Ci prawo dostępu do danych, ich sprostowania, usunięcia,
            ograniczenia przetwarzania, przenoszenia, a także prawo sprzeciwu
            wobec przetwarzania. W celu skorzystania z praw skontaktuj się z
            nami pod adresem{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-blue hover:underline">
              {COMPANY.email}
            </a>
            .
          </p>

          <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">
            6. Pliki cookies
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Strona może używać plików cookies do prawidłowego funkcjonowania.
            Cookies techniczne są niezbędne do działania serwisu. Możesz
            wyłączyć cookies w ustawieniach przeglądarki — może to wpłynąć na
            działanie niektórych funkcji strony.
          </p>

          <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">
            7. Kontakt w sprawach ochrony danych
          </h2>
          <p className="text-gray-600 leading-relaxed">
            W sprawach dotyczących ochrony danych osobowych możesz kontaktować
            się pisemnie pod adresem siedziby lub mailowo:{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-blue hover:underline">
              {COMPANY.email}
            </a>
            . Przysługuje Ci również prawo wniesienia skargi do Prezesa Urzędu
            Ochrony Danych Osobowych (uodo.gov.pl).
          </p>
        </div>
      </section>
    </div>
  );
}
