"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { COMPANY } from "@/lib/constants";

const navLinks = [
  { href: "/oferty", label: "Oferty" },
  { href: "/#uslugi", label: "Usługi" },
  { href: "/zarzadzanie-najmem", label: "Zarządzanie najmem" },
  { href: "/o-nas", label: "O nas" },
  { href: "/kontakt", label: "Kontakt" },
];

/* Inline SVG approximating the PRYZMAT prism logo mark */
function LogoMark() {
  return (
    <svg
      width="40"
      height="38"
      viewBox="0 0 100 94"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer triangle — blue stroke */}
      <path
        d="M50 4L96 88H4L50 4Z"
        fill="none"
        stroke="#2E6EC5"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Left inner fill — blue */}
      <path d="M50 22L14 82H50V22Z" fill="#2E6EC5" />
      {/* Right inner fill — red */}
      <path d="M30 82L50 26L70 82H30Z" fill="#C0392B" />
      {/* Bottom horizontal bar — red */}
      <rect x="24" y="78" width="52" height="8" rx="1" fill="#C0392B" />
    </svg>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-brand-navy shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {/* REPLACE LogoMark with next/image using /public/logo.png when available */}
            <LogoMark />
            <div className="flex flex-col leading-none">
              <span className="text-white font-extrabold text-xl tracking-wide">
                PRYZMAT
              </span>
              <span className="text-gray-300 text-[10px] font-medium tracking-widest uppercase">
                Biuro Nieruchomości
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-150 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — phone + CTA + hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${COMPANY.phone}`}
              className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">{COMPANY.phoneDisplay}</span>
            </a>

            <Link
              href="/kontakt?wycena=1"
              className="hidden sm:inline-flex items-center bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Bezpłatna wycena
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white p-1"
              aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden bg-brand-navy border-t border-blue-900/60">
          <div className="px-4 py-5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-white py-2.5 text-base font-medium border-b border-blue-900/40 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 text-gray-300 hover:text-white text-base"
              >
                <Phone className="w-4 h-4" />
                {COMPANY.phoneDisplay}
              </a>
              <Link
                href="/kontakt?wycena=1"
                onClick={() => setIsOpen(false)}
                className="block bg-brand-red text-white text-center px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Bezpłatna wycena
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
