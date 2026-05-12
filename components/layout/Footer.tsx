import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook } from "lucide-react";
import { COMPANY } from "@/lib/constants";

const navLinks = [
  { href: "/oferty", label: "Oferty" },
  { href: "/zarzadzanie-najmem", label: "Zarządzanie najmem" },
  { href: "/o-nas", label: "O nas" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/kontakt?wycena=1", label: "Bezpłatna wycena" },
];

function FooterLogoMark() {
  return (
    <svg
      width="36"
      height="34"
      viewBox="0 0 100 94"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M50 4L96 88H4L50 4Z"
        fill="none"
        stroke="#2E6EC5"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M50 22L14 82H50V22Z" fill="#2E6EC5" />
      <path d="M30 82L50 26L70 82H30Z" fill="#C0392B" />
      <rect x="24" y="78" width="52" height="8" rx="1" fill="#C0392B" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark-navy text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">

          {/* Col 1 — Logo + address */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <FooterLogoMark />
              <div>
                <p className="text-white font-extrabold text-lg leading-none">
                  PRYZMAT
                </p>
                <p className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">
                  Biuro Nieruchomości
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Rodzinne biuro nieruchomości z 11-letnim doświadczeniem.
              Pomagamy sprzedawać, kupować i wynajmować nieruchomości
              w Barczewie, Olsztynie i okolicach.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address.full)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-blue" />
                <span>{COMPANY.address.full}</span>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0 text-brand-blue" />
                <span>{COMPANY.email}</span>
              </a>
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Nawigacja
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact + hours */}
          <div className="space-y-5">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Kontakt
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 hover:text-white transition-colors font-medium text-base"
              >
                <Phone className="w-5 h-5 text-brand-red" />
                <span className="text-white">{COMPANY.phoneDisplay}</span>
              </a>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-brand-blue" />
                <div className="space-y-1">
                  <p>{COMPANY.hours.weekdays}</p>
                  <p>{COMPANY.hours.saturday}</p>
                  <p>{COMPANY.hours.sunday}</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 pt-2">
              <a
                href={COMPANY.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook PRYZMAT"
                className="w-9 h-9 bg-blue-900/50 rounded-lg flex items-center justify-center hover:bg-brand-blue transition-colors"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-blue-900/40 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            © {currentYear} {COMPANY.name}. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-4">
            <Link href="/polityka-prywatnosci" className="hover:text-gray-300 transition-colors">
              Polityka prywatności
            </Link>
            <Link href="/rodo" className="hover:text-gray-300 transition-colors">
              RODO
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
