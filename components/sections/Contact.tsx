"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas";
import { COMPANY } from "@/lib/constants";

// FAZA 3: Add AI chat button here

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "contact_section" }),
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

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent placeholder-gray-400 transition";

  return (
    <section id="kontakt" className="py-20 lg:py-28 bg-brand-light-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <p className="section-label mb-3">KONTAKT</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
            Skontaktuj się z nami
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-base">
            Odpiszemy lub oddzwonimy w ciągu 2 godzin w godzinach pracy biura.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-brand-navy mb-2">
                  Wiadomość wysłana!
                </h3>
                <p className="text-gray-500 text-sm">
                  Skontaktujemy się z Tobą wkrótce.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-brand-blue text-sm font-semibold hover:underline"
                >
                  Wyślij kolejną wiadomość
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register("imie")}
                      type="text"
                      placeholder="Imię *"
                      autoComplete="given-name"
                      className={inputClass}
                    />
                    {errors.imie && (
                      <p className="text-red-500 text-xs mt-1">{errors.imie.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("telefon")}
                      type="tel"
                      placeholder="Telefon *"
                      autoComplete="tel"
                      className={inputClass}
                    />
                    {errors.telefon && (
                      <p className="text-red-500 text-xs mt-1">{errors.telefon.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="E-mail (opcjonalnie)"
                    autoComplete="email"
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <select
                    {...register("szukasz")}
                    defaultValue=""
                    className={`${inputClass} text-gray-700`}
                  >
                    <option value="" disabled>
                      Czego szukasz? *
                    </option>
                    <option value="kupno">Chcę kupić nieruchomość</option>
                    <option value="sprzedaz">Chcę sprzedać nieruchomość</option>
                    <option value="wynajem">Szukam wynajmu</option>
                    <option value="zarzadzanie">
                      Zarządzanie najmem mojego mieszkania
                    </option>
                    <option value="inne">Inne zapytanie</option>
                  </select>
                  {errors.szukasz && (
                    <p className="text-red-500 text-xs mt-1">{errors.szukasz.message}</p>
                  )}
                </div>

                <div>
                  <textarea
                    {...register("wiadomosc")}
                    rows={4}
                    placeholder="Wiadomość (opcjonalnie)"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {serverError && (
                  <p className="text-red-500 text-sm">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-red text-white py-4 rounded-lg font-bold text-base hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Wysyłanie…" : "Wyślij wiadomość →"}
                </button>

                <p className="text-gray-400 text-xs text-center">
                  * Pola wymagane. Dane są przetwarzane zgodnie z{" "}
                  <a href="/rodo" className="underline hover:text-gray-600">
                    polityką RODO
                  </a>
                  .
                </p>
              </form>
            )}
          </div>

          {/* Address card */}
          <div className="space-y-6">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
              <h3 className="font-bold text-brand-navy text-lg">
                Dane kontaktowe
              </h3>

              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Zadzwoń
                  </p>
                  <p className="font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                    {COMPANY.phoneDisplay}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    E-mail
                  </p>
                  <p className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors text-sm">
                    {COMPANY.email}
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Adres
                  </p>
                  <p className="font-semibold text-brand-navy text-sm">
                    {COMPANY.address.street}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {COMPANY.address.postalCode} {COMPANY.address.city}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Godziny pracy
                  </p>
                  <p className="text-gray-600 text-sm">{COMPANY.hours.weekdays}</p>
                  <p className="text-gray-600 text-sm">{COMPANY.hours.saturday}</p>
                  <p className="text-gray-400 text-sm">{COMPANY.hours.sunday}</p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            {/* FAZA 3: Embed real Google Maps iframe */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 h-48 bg-gray-100 flex items-center justify-center">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address.full)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand-blue transition-colors"
              >
                <MapPin className="w-8 h-8" />
                <span className="text-sm font-medium">Otwórz w Mapach Google</span>
                <span className="text-xs">{COMPANY.address.full}</span>
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
