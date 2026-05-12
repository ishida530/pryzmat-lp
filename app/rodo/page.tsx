import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  ...createMetadata(
    "RODO — klauzula informacyjna",
    "Klauzula informacyjna RODO — informacje o przetwarzaniu danych osobowych przez Biuro Nieruchomości PRYZMAT zgodnie z art. 13 RODO.",
    "/rodo"
  ),
  robots: { index: false, follow: false },
};

const sections = [
  {
    title: "1. Administrator danych osobowych",
    content: (
      <>
        Administratorem Twoich danych osobowych jest{" "}
        <strong>{COMPANY.name}</strong>, z siedzibą pod adresem{" "}
        <strong>{COMPANY.address.full}</strong>.
        <br />
        Kontakt z administratorem:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            e-mail:{" "}
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-brand-blue hover:underline"
            >
              {COMPANY.email}
            </a>
          </li>
          <li>
            telefon:{" "}
            <a
              href={`tel:${COMPANY.phone}`}
              className="text-brand-blue hover:underline"
            >
              {COMPANY.phoneDisplay}
            </a>
          </li>
          <li>adres korespondencyjny: {COMPANY.address.full}</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. Cel i podstawa prawna przetwarzania danych",
    content: (
      <>
        Twoje dane osobowe przetwarzamy w następujących celach:
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Obsługa zapytań i kontaktu</strong> — na podstawie art. 6
            ust. 1 lit. b RODO (niezbędność do podjęcia działań na żądanie osoby
            przed zawarciem umowy) lub lit. f RODO (prawnie uzasadniony interes
            administratora w udzieleniu odpowiedzi na pytanie).
          </li>
          <li>
            <strong>Zawarcie i wykonanie umowy pośrednictwa</strong> — na
            podstawie art. 6 ust. 1 lit. b RODO (wykonanie umowy).
          </li>
          <li>
            <strong>Wypełnienie obowiązków prawnych</strong> (np. księgowość,
            archiwizacja) — na podstawie art. 6 ust. 1 lit. c RODO.
          </li>
          <li>
            <strong>Marketing własnych usług</strong> — na podstawie art. 6 ust.
            1 lit. f RODO (prawnie uzasadniony interes), wyłącznie wobec
            dotychczasowych klientów, lub na podstawie udzielonej zgody (lit. a
            RODO).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Zakres przetwarzanych danych",
    content: (
      <>
        Za pośrednictwem formularzy kontaktowych zbieramy:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>imię i nazwisko (lub samo imię),</li>
          <li>numer telefonu,</li>
          <li>adres e-mail (opcjonalnie),</li>
          <li>treść wiadomości / opis potrzeby.</li>
        </ul>
        <p className="mt-3">
          W ramach realizacji umowy pośrednictwa możemy przetwarzać dodatkowo:
          dane adresowe nieruchomości, informacje o stanie prawnym nieruchomości,
          dane finansowe niezbędne do przeprowadzenia transakcji.
        </p>
      </>
    ),
  },
  {
    title: "4. Odbiorcy danych",
    content: (
      <>
        Twoje dane mogą być przekazywane:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            podmiotom świadczącym usługi na nasze zlecenie (np. obsługa IT,
            hosting, oprogramowanie CRM) — wyłącznie w zakresie niezbędnym do
            realizacji usługi, na podstawie umów powierzenia;
          </li>
          <li>
            kancelariom notarialnym i doradcom kredytowym — w zakresie
            niezbędnym do finalizacji transakcji, za Twoją wiedzą;
          </li>
          <li>
            organom publicznym — wyłącznie gdy wymagają tego przepisy prawa.
          </li>
        </ul>
        <p className="mt-3">
          Nie sprzedajemy danych osobowych podmiotom trzecim.
        </p>
      </>
    ),
  },
  {
    title: "5. Okres przechowywania danych",
    content: (
      <>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Dane z formularzy kontaktowych — do 12 miesięcy od ostatniego
            kontaktu, chyba że doszło do zawarcia umowy.
          </li>
          <li>
            Dane związane z umową pośrednictwa — przez okres trwania umowy oraz
            5 lat od jej zakończenia (lub dłużej, jeśli wymagają tego przepisy
            prawa, np. podatkowe).
          </li>
          <li>
            Dane przetwarzane na podstawie zgody — do momentu jej wycofania.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Twoje prawa",
    content: (
      <>
        Przysługują Ci następujące prawa w zakresie danych osobowych:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>prawo dostępu</strong> do swoich danych (art. 15 RODO),
          </li>
          <li>
            <strong>prawo do sprostowania</strong> danych (art. 16 RODO),
          </li>
          <li>
            <strong>prawo do usunięcia</strong> danych (&bdquo;prawo do bycia
            zapomnianym&rdquo;) — w granicach określonych art. 17 RODO,
          </li>
          <li>
            <strong>prawo do ograniczenia przetwarzania</strong> (art. 18 RODO),
          </li>
          <li>
            <strong>prawo do przenoszenia danych</strong> (art. 20 RODO) — gdy
            podstawą jest zgoda lub umowa,
          </li>
          <li>
            <strong>prawo sprzeciwu</strong> wobec przetwarzania na podstawie
            prawnie uzasadnionego interesu (art. 21 RODO),
          </li>
          <li>
            <strong>prawo cofnięcia zgody</strong> w dowolnym momencie, bez
            wpływu na zgodność z prawem przetwarzania przed jej cofnięciem.
          </li>
        </ul>
        <p className="mt-3">
          Aby skorzystać z powyższych praw, skontaktuj się z nami pod adresem:{" "}
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-brand-blue hover:underline"
          >
            {COMPANY.email}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "7. Prawo skargi do organu nadzorczego",
    content: (
      <>
        Jeżeli uważasz, że przetwarzanie Twoich danych narusza przepisy RODO,
        masz prawo wniesienia skargi do organu nadzorczego — w Polsce jest to{" "}
        <strong>Prezes Urzędu Ochrony Danych Osobowych</strong> (UODO), ul. Stawki
        2, 00-193 Warszawa,{" "}
        <a
          href="https://uodo.gov.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue hover:underline"
        >
          uodo.gov.pl
        </a>
        .
      </>
    ),
  },
  {
    title: "8. Dobrowolność podania danych",
    content: (
      <>
        Podanie danych osobowych za pośrednictwem formularza kontaktowego jest
        dobrowolne, lecz niezbędne do udzielenia odpowiedzi na Twoje zapytanie.
        Niepodanie danych skutkuje brakiem możliwości kontaktu. W przypadku
        zawarcia umowy pośrednictwa podanie danych jest warunkiem jej wykonania.
      </>
    ),
  },
  {
    title: "9. Zautomatyzowane podejmowanie decyzji",
    content: (
      <>
        Twoje dane nie są przetwarzane w sposób zautomatyzowany w celu
        podejmowania decyzji, w tym profilowania, wywołującego skutki prawne lub
        w podobny sposób istotnie na Ciebie wpływającego.
      </>
    ),
  },
];

export default function RodoPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            DOKUMENTY PRAWNE
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white">
            Klauzula informacyjna RODO
          </h1>
          <p className="text-gray-300 mt-3 text-sm">
            Informacja o przetwarzaniu danych osobowych zgodnie z art. 13
            Rozporządzenia RODO (UE) 2016/679.
          </p>
          <p className="text-gray-400 mt-2 text-xs">
            Ostatnia aktualizacja: styczeń 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map(({ title, content }) => (
              <div key={title}>
                <h2 className="text-lg font-bold text-brand-navy mb-3 pb-2 border-b border-gray-100">
                  {title}
                </h2>
                <div className="text-gray-600 text-sm leading-relaxed">
                  {content}
                </div>
              </div>
            ))}
          </div>

          {/* Link to privacy policy */}
          <div className="mt-12 p-5 bg-brand-light-blue rounded-xl border border-blue-100">
            <p className="text-sm text-gray-600">
              Szczegółowe informacje o plikach cookies i zasadach korzystania ze
              strony znajdziesz w naszej{" "}
              <a
                href="/polityka-prywatnosci"
                className="text-brand-blue font-semibold hover:underline"
              >
                Polityce prywatności
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
