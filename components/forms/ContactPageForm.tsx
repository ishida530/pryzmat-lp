"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas";
import { COMPANY } from "@/lib/constants";

// FAZA 3: Add AI chat button near the contact form

const inputClass =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent placeholder-gray-400 transition bg-white";

function paramToSzukasz(cel: string | null, wycena: string | null): ContactFormData["szukasz"] | "" {
  if (cel === "zarzadzanie") return "zarzadzanie";
  if (cel === "kupno") return "kupno";
  if (cel === "sprzedaz" || wycena === "1") return "sprzedaz";
  if (cel === "wynajem") return "wynajem";
  return "";
}

export function ContactPageForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const defaultSzukasz = paramToSzukasz(
    searchParams.get("cel"),
    searchParams.get("wycena")
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // Apply URL-driven pre-fill after mount (avoids hydration mismatch)
  useEffect(() => {
    if (defaultSzukasz) {
      setValue("szukasz", defaultSzukasz);
    }
  }, [defaultSzukasz, setValue]);

  async function onSubmit(data: ContactFormData) {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "contact_page" }),
      });
      if (res.ok) {
        setSubmitted(true);
        reset();
      } else {
        setServerError("Wystąpił błąd. Zadzwoń do nas bezpośrednio.");
      }
    } catch {
      setServerError("Brak połączenia. Zadzwoń do nas bezpośrednio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12">

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-brand-red" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-extrabold text-brand-navy text-lg leading-tight">
              Formularz kontaktowy
            </h2>
            <p className="text-gray-400 text-sm">Pola oznaczone * są wymagane</p>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
            <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-brand-navy mb-2">Wiadomość wysłana!</h3>
            <p className="text-gray-500 text-sm mb-6">Skontaktujemy się z Tobą wkrótce.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-brand-blue text-sm font-semibold hover:underline"
            >
              Wyślij kolejną wiadomość
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formularz kontaktowy" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cpf-imie" className="sr-only">Imię</label>
                <input
                  {...register("imie")}
                  id="cpf-imie"
                  type="text"
                  placeholder="Imię *"
                  autoComplete="given-name"
                  aria-invalid={!!errors.imie}
                  aria-describedby={errors.imie ? "cpf-imie-error" : undefined}
                  className={inputClass}
                />
                {errors.imie && (
                  <p id="cpf-imie-error" role="alert" className="text-red-500 text-xs mt-1">{errors.imie.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="cpf-telefon" className="sr-only">Telefon</label>
                <input
                  {...register("telefon")}
                  id="cpf-telefon"
                  type="tel"
                  placeholder="Telefon *"
                  autoComplete="tel"
                  aria-invalid={!!errors.telefon}
                  aria-describedby={errors.telefon ? "cpf-telefon-error" : undefined}
                  className={inputClass}
                />
                {errors.telefon && (
                  <p id="cpf-telefon-error" role="alert" className="text-red-500 text-xs mt-1">{errors.telefon.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="cpf-email" className="sr-only">E-mail</label>
              <input
                {...register("email")}
                id="cpf-email"
                type="email"
                placeholder="E-mail (opcjonalnie)"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "cpf-email-error" : undefined}
                className={inputClass}
              />
              {errors.email && (
                <p id="cpf-email-error" role="alert" className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="cpf-szukasz" className="sr-only">Czego szukasz?</label>
              <select
                {...register("szukasz")}
                id="cpf-szukasz"
                defaultValue={defaultSzukasz || ""}
                aria-invalid={!!errors.szukasz}
                aria-describedby={errors.szukasz ? "cpf-szukasz-error" : undefined}
                className={`${inputClass} text-gray-700`}
              >
                <option value="" disabled>Czego szukasz? *</option>
                <option value="kupno">Chcę kupić nieruchomość</option>
                <option value="sprzedaz">Chcę sprzedać nieruchomość</option>
                <option value="wynajem">Szukam mieszkania do wynajęcia</option>
                <option value="zarzadzanie">Zarządzanie moim mieszkaniem</option>
                <option value="inne">Inne zapytanie</option>
              </select>
              {errors.szukasz && (
                <p id="cpf-szukasz-error" role="alert" className="text-red-500 text-xs mt-1">{errors.szukasz.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="cpf-wiadomosc" className="sr-only">Wiadomość</label>
              <textarea
                {...register("wiadomosc")}
                id="cpf-wiadomosc"
                rows={5}
                placeholder="Wiadomość (opcjonalnie)"
                className={`${inputClass} resize-none`}
              />
            </div>

            {serverError && <p role="alert" className="text-red-500 text-sm">{serverError}</p>}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-brand-red text-white py-4 rounded-lg font-bold text-base hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Wysyłanie…" : <><span>Wyślij wiadomość</span><span aria-hidden="true"> →</span></>}
            </button>

            <p className="text-gray-400 text-xs text-center">
              Dane są przetwarzane zgodnie z{" "}
              <a href="/rodo" className="underline hover:text-gray-600">klauzulą RODO</a>.
            </p>
          </form>
        )}
      </div>

      {/* Address card */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="font-extrabold text-brand-navy text-xl">Dane kontaktowe</h2>

          <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-brand-red" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Zadzwoń</p>
              <p className="font-bold text-brand-navy text-lg group-hover:text-brand-blue transition-colors">
                {COMPANY.phoneDisplay}
              </p>
              <p className="text-gray-400 text-xs">Kliknij, żeby zadzwonić</p>
            </div>
          </a>

          <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-brand-blue" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">E-mail</p>
              <p className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors">
                {COMPANY.email}
              </p>
            </div>
          </a>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-gray-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Adres biura</p>
              <p className="font-semibold text-brand-navy">{COMPANY.address.street}</p>
              <p className="text-gray-500">{COMPANY.address.postalCode} {COMPANY.address.city}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-gray-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Godziny pracy</p>
              <p className="text-gray-600 text-sm font-medium">{COMPANY.hours.weekdays}</p>
              <p className="text-gray-600 text-sm font-medium">{COMPANY.hours.saturday}</p>
              <p className="text-gray-400 text-sm">{COMPANY.hours.sunday}</p>
            </div>
          </div>
        </div>

        {/* Office map — OpenStreetMap embed */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {(() => {
            const { geoLat: lat, geoLng: lng } = COMPANY.address;
            const delta = 0.006;
            const bbox  = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
            const src   = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
            const link  = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
            return (
              <>
                <iframe
                  src={src}
                  title="Lokalizacja biura PRYZMAT"
                  className="w-full h-52 block"
                  loading="lazy"
                />
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white border-t border-gray-100 text-brand-blue text-xs hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {COMPANY.address.full} — Otwórz w OpenStreetMap →
                </a>
              </>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
