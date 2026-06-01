import { Suspense } from "react";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Users } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { getUsers } from "@/lib/asari";
import type { AsariUser } from "@/lib/asari";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata(
  "Nasz zespół — biuro nieruchomości PRYZMAT Barczewo",
  "Poznaj nasz zespół agentów nieruchomości z Barczewa i Olsztyna. Doświadczeni, lokalni specjaliści z rynku warmińsko-mazurskiego.",
  "/zespol"
);

function AgentTile({ user }: { user: AsariUser }) {
  const initials  = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase();
  const photoUrl  = user.imageId ? `https://img.asariweb.pl/normal/${user.imageId}` : null;
  const fullName  = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col items-center text-center">
      {/* Photo or initials */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-navy/10 flex items-center justify-center mb-5 shrink-0">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={fullName}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-brand-navy font-extrabold text-2xl">{initials}</span>
        )}
      </div>

      <h2 className="font-extrabold text-brand-navy text-lg mb-1">{fullName}</h2>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Agent nieruchomości</p>

      <div className="space-y-2 w-full">
        {user.phoneNumber && (
          <a
            href={`tel:${user.phoneNumber}`}
            className="flex items-center justify-center gap-2 text-sm text-brand-navy hover:text-brand-blue transition-colors font-medium"
          >
            <Phone className="w-4 h-4" />
            {user.phoneNumber}
          </a>
        )}
        {user.email && (
          <a
            href={`mailto:${user.email}`}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-blue transition-colors truncate"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{user.email}</span>
          </a>
        )}
      </div>

      <Link
        href={`/kontakt?agent=${encodeURIComponent(fullName)}`}
        className="mt-6 w-full bg-brand-navy text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-900 transition-colors"
      >
        Skontaktuj się
      </Link>
    </div>
  );
}

async function TeamList() {
  let users: AsariUser[] = [];
  try {
    users = await getUsers();
  } catch (err) {
    console.error("[ASARI] getUsers failed:", err);
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">Nie udało się pobrać listy agentów.</p>
        <p className="text-sm mt-1">Sprawdź konfigurację ASARI API.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {users.map((user) => (
        <AgentTile key={user.id} user={user} />
      ))}
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-5" />
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
}

export default function ZespolPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden py-14 lg:py-20 bg-brand-dark-navy">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(46,110,197,0.22) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            ZESPÓŁ
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">
            Nasz <span className="text-blue-300">zespół agentów</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl">
            Lokalni specjaliści z wieloletnim doświadczeniem na rynku nieruchomości
            w Barczewie, Olsztynie i powiecie olsztyńskim.
          </p>
        </div>
      </div>

      {/* Team grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<TeamSkeleton />}>
          <TeamList />
        </Suspense>

        {/* CTA */}
        <div className="mt-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
          <h2 className="text-2xl font-extrabold text-brand-navy mb-3">
            Dołącz do naszego zespołu
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Szukamy doświadczonych agentów nieruchomości. Oferujemy elastyczne
            warunki współpracy i dostęp do systemu CRM.
          </p>
          <Link
            href={`/kontakt?cel=inne`}
            className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
          >
            Skontaktuj się z nami
          </Link>
        </div>
      </div>
    </div>
  );
}
