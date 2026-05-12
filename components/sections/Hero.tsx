"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { leadFormSchema, type LeadFormData } from "@/lib/schemas";

// FAZA 3: This card will be replaced by AI chatbot widget

export function Hero() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

  async function onSubmit(data: LeadFormData) {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "hero_lead" }),
      });
      if (res.ok) {
        setSubmitted(true);
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
    <section className="relative overflow-hidden">
      {/* Full-width background property photo — REPLACE with actual local property photo */}
      <Image
        src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80"
        alt="Nieruchomości w Olsztynie i okolicach"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Gradient overlay: dark on left for text, fades right */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark-navy/95 via-brand-dark-navy/85 to-brand-navy/70" />

      {/* Subtle blue glow accent on left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 70% at 15% 55%, rgba(46,110,197,0.25) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">

          {/* ── Left column: 3/5 ── */}
          <div className="lg:col-span-3 space-y-7 order-1 lg:order-1">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 border border-brand-red/40 bg-brand-red/10 text-brand-red px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase animate-fade-up"
              style={{ animationDelay: "0ms" }}
            >
              BARCZEWO · OLSZTYN · WARMIA
            </div>

            {/* H1 — contains SEO keyword */}
            <h1
              className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white leading-[1.15] tracking-tight text-balance animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              Sprzedaj, kup lub wynajmij{" "}
              <span className="text-blue-300">nieruchomość</span>{" "}
              w&nbsp;Olsztynie i&nbsp;okolicach
            </h1>

            <p
              className="text-gray-300 text-lg leading-relaxed max-w-xl animate-fade-up"
              style={{ animationDelay: "220ms" }}
            >
              Rodzinne{" "}
              <strong className="text-white">
                biuro nieruchomości Barczewo
              </strong>{" "}
              z{" "}
              <strong className="text-white">
                11&#8209;letnim doświadczeniem
              </strong>
              . Znamy tutejszy rynek lepiej niż ktokolwiek inny — od Barczewa
              po Olsztyn i całą Warmię.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-up"
              style={{ animationDelay: "360ms" }}
            >
              <Link
                href="/oferty"
                className="inline-flex items-center justify-center bg-brand-red text-white px-8 py-4 rounded-lg text-base font-bold hover:bg-red-700 transition-colors"
              >
                Zobacz aktualne oferty
              </Link>
              <Link
                href="/kontakt?wycena=1"
                className="inline-flex items-center justify-center bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-base font-bold hover:bg-white hover:text-brand-navy transition-all"
              >
                Bezpłatna wycena nieruchomości
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="flex items-center gap-3 pt-1 animate-fade-up"
              style={{ animationDelay: "480ms" }}
            >
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-300 text-sm">
                Zaufały nam setki klientów z regionu
              </span>
            </div>
          </div>

          {/* ── Right column: 2/5 — lead card ── */}
          <div
            className="lg:col-span-2 order-2 lg:order-2 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            {/* FAZA 3: Replace this card with AI chatbot widget */}
            <div className="bg-white rounded-2xl shadow-2xl p-7 lg:p-8">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-extrabold text-brand-navy mb-2">
                      Dziękujemy!
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Oddzwonimy w ciągu 2 godzin w godzinach pracy biura.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-extrabold text-brand-navy leading-snug">
                        Chcę zlecić sprzedaż / wynajem
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Wypełnij formularz — oddzwonimy bezpłatnie
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="space-y-3.5"
                    >
                      {/* Imię + Telefon — side by side */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            {...register("imie")}
                            type="text"
                            placeholder="Imię"
                            autoComplete="given-name"
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent placeholder-gray-400"
                          />
                          {errors.imie && (
                            <p className="text-red-500 text-[11px] mt-1">
                              {errors.imie.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            {...register("telefon")}
                            type="tel"
                            placeholder="Telefon"
                            autoComplete="tel"
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent placeholder-gray-400"
                          />
                          {errors.telefon && (
                            <p className="text-red-500 text-[11px] mt-1">
                              {errors.telefon.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <select
                          {...register("rodzajNieruchomosci")}
                          defaultValue=""
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-gray-700"
                        >
                          <option value="" disabled>
                            Rodzaj nieruchomości
                          </option>
                          <option value="mieszkanie">Mieszkanie</option>
                          <option value="dom">Dom</option>
                          <option value="dzialka">Działka</option>
                          <option value="inne">Inne</option>
                        </select>
                        {errors.rodzajNieruchomosci && (
                          <p className="text-red-500 text-[11px] mt-1">
                            {errors.rodzajNieruchomosci.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <select
                          {...register("cel")}
                          defaultValue=""
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-gray-700"
                        >
                          <option value="" disabled>
                            Cel
                          </option>
                          <option value="sprzedaz">Sprzedaż</option>
                          <option value="wynajem">Wynajem</option>
                          <option value="zarzadzanie">
                            Zarządzanie najmem
                          </option>
                        </select>
                        {errors.cel && (
                          <p className="text-red-500 text-[11px] mt-1">
                            {errors.cel.message}
                          </p>
                        )}
                      </div>

                      {serverError && (
                        <p className="text-red-500 text-sm">{serverError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-red text-white py-4 rounded-lg font-bold text-base hover:bg-red-700 transition-colors disabled:opacity-50 mt-1"
                      >
                        {loading
                          ? "Wysyłanie…"
                          : "Umów bezpłatną wycenę →"}
                      </button>
                    </form>

                    <p className="text-center text-gray-400 text-[11px] mt-4 leading-relaxed">
                      Oddzwaniamy w ciągu 2 godzin · bez zobowiązań
                    </p>
                  </>
                )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
