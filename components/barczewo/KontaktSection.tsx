"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({
  imie:    z.string().min(2, "Wpisz imię i nazwisko"),
  telefon: z.string().min(9, "Wpisz numer telefonu"),
  email:   z.string().email("Wpisz poprawny adres e-mail"),
  typ:     z.enum(["deweloper", "inwestor_prywatny", "fundusz", "inne"], {
    required_error: "Wybierz typ inwestora",
  }),
});

type FormData = z.infer<typeof schema>;

const DOCS = [
  {
    label: "Plan zagospodarowania terenu",
    desc: "Koncepcja — Plansza 1",
    path: "/docs/pzt-koncepcja-plansza-1.pdf",
  },
  {
    label: "Rzut parteru z metrażami",
    desc: "Plansza 3",
    path: "/docs/a1-rzut-parteru-plansza-3.pdf",
  },
  {
    label: "Rzut powtarzalnej kondygnacji",
    desc: "Plansza 4",
    path: "/docs/a2-rzut-kondygnacji-plansza-4.pdf",
  },
  {
    label: "Rzut garażu podziemnego",
    desc: "41 miejsc postojowych",
    path: "/docs/p1-rzut-garazu.pdf",
  },
  {
    label: "Wypis z MPZP",
    desc: "B50MW Barczewo",
    path: "/docs/mpzp-barczewo.pdf",
  },
  {
    label: "Mapa podziału działki",
    desc: "393/11 — gotowy geodezyjnie",
    path: "/docs/mapa-podzial-barczewo-393-1.pdf",
  },
  {
    label: "Oryginalna oferta inwestycyjna",
    desc: "List Jerzego Sawczuka z opisem inwestycji",
    path: "/docs/oferta-dla-deweloperow.pdf",
  },
];

export function KontaktSection() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/kontakt-barczewo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "barczewo_lead" }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setServerError(json.error ?? "Wystąpił błąd. Spróbuj ponownie.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Brak połączenia. Spróbuj ponownie.");
    }
  };

  return (
    <section
      id="kontakt"
      className="py-24 md:py-36"
      style={{ background: "#1B3A6B" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left — intro */}
          <div>
            <p className="b-section-label mb-6 flex items-center gap-3" style={{ color: "#9a7b3a" }}>
              <span className="b-gold-line" />
              Pierwszy krok
            </p>
            <h2
              className="font-playfair mb-6"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.875rem)", color: "#f9f7f3" }}
            >
              Jedna rozmowa.
              <br />
              Bez zobowiązań.
            </h2>
            <p
              className="text-base mb-10"
              style={{ color: "rgba(249,247,243,0.6)", lineHeight: "1.8", maxWidth: "28rem" }}
            >
              Wypełnij formularz lub zadzwoń bezpośrednio do Jerzego Sawczuka.
              Pierwsza rozmowa trwa 15 minut i odpowie na wszystkie pytania.
              Bez presji — konkretna rozmowa o konkretnych liczbach.
              Po wypełnieniu otrzymasz dostęp do pełnej dokumentacji.
            </p>

            {/* Contact details */}
            <div
              className="space-y-4 pt-8"
              style={{ borderTop: "1px solid rgba(154,123,58,0.35)" }}
            >
              <ContactDetail icon="phone" label="Biuro" value="+48 503 397 360" href="tel:+48503397360" />
              <ContactDetail icon="phone" label="Jerzy Sawczuk (bezpośredni)" value="+48 607 677 034" href="tel:+48607677034" />
              <ContactDetail icon="mail"  label="E-mail"  value="biuro@marzdom.pl"  href="mailto:biuro@marzdom.pl" />
              <ContactDetail icon="pin"   label="Adres"   value="Barczewko 126B, 11-010 Barczewo" />
              <div className="pt-2">
                <p className="text-xs" style={{ color: "rgba(249,247,243,0.35)" }}>
                  Pon–Pt 9:00–20:00 · Sob 10:00–15:00 · Niedz 9:00–16:00
                </p>
              </div>
            </div>
          </div>

          {/* Right — form or success */}
          <div>
            {/* Opcja prosta — zakup samej działki */}
            <div
              className="rounded-sm px-6 py-5 mb-8"
              style={{
                background: "rgba(249,247,243,0.07)",
                border: "1px solid rgba(249,247,243,0.15)",
              }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "#9a7b3a" }}
              >
                Jeśli interesuje Cię tylko zakup działki
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(249,247,243,0.6)" }}
              >
                Rozumiemy że nie każdy chce angażować się w projekt budowlany.
                Jeśli szukasz działki inwestycyjnej z pełnym MPZP
                w dobrej lokalizacji — ta oferta też jest dla Ciebie.
                Cena: 1 700 000 zł, do negocjacji.
              </p>
            </div>

            {!submitted ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-5"
              >
                <Field
                  label="Imię i nazwisko"
                  error={errors.imie?.message}
                >
                  <input
                    {...register("imie")}
                    type="text"
                    placeholder="Jan Kowalski"
                    className="b-input"
                  />
                </Field>

                <Field
                  label="Telefon"
                  error={errors.telefon?.message}
                >
                  <input
                    {...register("telefon")}
                    type="tel"
                    placeholder="+48 600 000 000"
                    className="b-input"
                  />
                </Field>

                <Field
                  label="Adres e-mail"
                  error={errors.email?.message}
                >
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="jan@firma.pl"
                    className="b-input"
                  />
                </Field>

                <Field
                  label="Typ inwestora"
                  error={errors.typ?.message}
                >
                  <select {...register("typ")} className="b-input">
                    <option value="">Wybierz…</option>
                    <option value="inwestor_prywatny">Inwestor prywatny</option>
                    <option value="fundusz">Fundusz inwestycyjny</option>
                    <option value="inne">Inne</option>
                    <option value="deweloper">Deweloper</option>
                  </select>
                </Field>

                {serverError && (
                  <p className="text-sm" style={{ color: "#f87171" }}>
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 px-8 py-4 font-semibold text-sm tracking-wide transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: "#C0392B",
                    color: "#fff",
                    borderRadius: "2px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isSubmitting ? "Wysyłanie…" : "Wyślij i pobierz dokumentację"}
                </button>

                <p className="text-sm mt-1" style={{ color: "rgba(249,247,243,0.45)" }}>
                  Lub zadzwoń bezpośrednio:{" "}
                  <a
                    href="tel:+48607677034"
                    className="font-bold hover:opacity-80 transition-opacity"
                    style={{ color: "#f9f7f3" }}
                  >
                    +48 607 677 034
                  </a>{" "}
                  — Jerzy Sawczuk
                </p>

                <p
                  className="text-xs"
                  style={{ color: "rgba(249,247,243,0.3)", lineHeight: "1.6" }}
                >
                  Dane są przetwarzane wyłącznie w celu odpowiedzi na zapytanie.
                  Nie trafiają do baz marketingowych.
                </p>
              </form>
            ) : (
              <SuccessState />
            )}
          </div>
        </div>

        {/* Teczka strip */}
        <div
          className="mt-12 pt-10"
          style={{ borderTop: "1px solid rgba(154,123,58,0.2)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <div className="flex-1">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "#9a7b3a" }}
              >
                Materiał do pobrania
              </p>
              <p
                className="font-playfair mb-2"
                style={{ fontSize: "clamp(1.25rem, 2vw, 1.625rem)", color: "#f9f7f3" }}
              >
                Teczka inwestycyjna PDF
              </p>
              <p
                className="text-sm"
                style={{ color: "rgba(249,247,243,0.5)", lineHeight: "1.7", maxWidth: "28rem" }}
              >
                7 stron gotowych do wydruku lub wysłania. Pełna analiza finansowa,
                parametry, argumenty i dane kontaktowe — w jednym pliku.
              </p>
            </div>
            <Link
              href="/inwestycja-barczewo/teczka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 font-semibold text-sm tracking-wide transition-opacity hover:opacity-80"
              style={{
                background: "rgba(154,123,58,0.15)",
                color: "#9a7b3a",
                border: "1px solid rgba(154,123,58,0.35)",
                letterSpacing: "0.04em",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1v8M4 6l3 3 3-3M1 11v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Otwórz teczkę PDF
            </Link>
          </div>
        </div>

      {/* Pre-sale strip — apartment buyers */}
        <div
          className="mt-20 pt-14 grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-center"
          style={{ borderTop: "1px solid rgba(154,123,58,0.2)" }}
        >
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#9a7b3a" }}
            >
              Szukasz mieszkania w Barczewie?
            </p>
            <p
              className="font-playfair mb-3"
              style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: "#f9f7f3" }}
            >
              Zapisz się na listę pierwszeństwa.
            </p>
            <p
              className="text-sm"
              style={{ color: "rgba(249,247,243,0.5)", lineHeight: "1.8", maxWidth: "30rem" }}
            >
              Gdy projekt ruszy — dowiesz się zanim pojawi się pierwsze ogłoszenie.
              Poinformujemy Cię o metrażach, cenach i terminie oddania. Bez zobowiązań.
            </p>
          </div>
          <a
            href="tel:+48503397360"
            className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 font-semibold text-sm tracking-wide transition-opacity hover:opacity-80"
            style={{
              background: "rgba(154,123,58,0.15)",
              color: "#9a7b3a",
              border: "1px solid rgba(154,123,58,0.35)",
              letterSpacing: "0.04em",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M13.5 10.5l-2-2a1 1 0 00-1.414 0l-.707.707a8.08 8.08 0 01-3.586-3.586l.707-.707A1 1 0 006.5 3.5l-2-2A1 1 0 003.086 1.5L1.5 3.086A2 2 0 001.2 5.4 13 13 0 009.6 13.8a2 2 0 002.314-.3l1.586-1.586A1 1 0 0013.5 10.5z"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
            Zadzwoń: 503 397 360
          </a>
        </div>

      </div>
    </section>
  );
}

/* ─── Success state with document list ─── */
function SuccessState() {
  return (
    <div className="b-fade-up">
      {/* Confirmation message */}
      <div
        className="mb-8 p-6"
        style={{ background: "rgba(154,123,58,0.15)", border: "1px solid rgba(154,123,58,0.4)", borderRadius: "2px" }}
      >
        <p
          className="font-semibold text-base mb-1"
          style={{ color: "#9a7b3a" }}
        >
          Dziękujemy — odezwiemy się w ciągu 2 godzin.
        </p>
        <p className="text-sm" style={{ color: "rgba(249,247,243,0.55)" }}>
          Poniżej pełna dokumentacja techniczna projektu.
        </p>
      </div>

      {/* Document list */}
      <p
        className="text-xs font-bold tracking-widest uppercase mb-4"
        style={{ color: "#9a7b3a" }}
      >
        Dokumentacja do pobrania
      </p>
      <div className="space-y-2">
        {DOCS.map((doc) => (
          <a
            key={doc.path}
            href={encodeURI(doc.path)}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 px-5 py-4 group transition-colors duration-150 hover:bg-white/5"
            style={{
              border: "1px solid rgba(249,247,243,0.12)",
              borderRadius: "2px",
            }}
          >
            <div>
              <p
                className="font-semibold text-sm group-hover:underline"
                style={{ color: "#f9f7f3" }}
              >
                {doc.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(249,247,243,0.35)" }}>
                {doc.desc}
              </p>
            </div>
            {/* Download icon */}
            <div
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
              style={{ color: "#9a7b3a" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1v9m0 0L5 7m3 3l3-3M1 12v1a2 2 0 002 2h10a2 2 0 002-2v-1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── Field wrapper ─── */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold tracking-wide"
        style={{ color: "rgba(249,247,243,0.6)" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Contact detail row ─── */
function ContactDetail({
  icon,
  label,
  value,
  href,
}: {
  icon: "phone" | "mail" | "pin";
  label: string;
  value: string;
  href?: string;
}) {
  const Icon =
    icon === "phone" ? (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M13.5 10.5l-2-2a1 1 0 00-1.414 0l-.707.707a8.08 8.08 0 01-3.586-3.586l.707-.707A1 1 0 006.5 3.5l-2-2A1 1 0 003.086 1.5L1.5 3.086A2 2 0 001.2 5.4 13 13 0 009.6 13.8a2 2 0 002.314-.3l1.586-1.586A1 1 0 0013.5 10.5z"
          stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ) : icon === "mail" ? (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M1 4.5l6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ) : (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1C5.015 1 3 3.015 3 5.5c0 3.5 4.5 8.5 4.5 8.5S12 9 12 5.5C12 3.015 9.985 1 7.5 1zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
          stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    );

  const inner = (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex-shrink-0"
        style={{ color: "#9a7b3a" }}
      >
        {Icon}
      </span>
      <div>
        <p className="text-xs mb-0.5" style={{ color: "rgba(249,247,243,0.35)" }}>
          {label}
        </p>
        <p className="text-sm font-medium" style={{ color: "#f9f7f3" }}>
          {value}
        </p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="hover:opacity-80 transition-opacity">
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  );
}
