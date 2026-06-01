import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import type { Offer } from "@/components/sections/OffersClient";

interface Props {
  agent: NonNullable<Offer["agent"]>;
}

export function AgentCard({ agent }: Props) {
  const initials  = `${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`.toUpperCase();
  const photoUrl  = agent.imageId ? `https://img.asariweb.pl/normal/${agent.imageId}` : null;
  const fullName  = `${agent.firstName} ${agent.lastName}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        Twój agent
      </p>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-brand-navy/10 flex items-center justify-center shrink-0">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={fullName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-brand-navy font-extrabold text-lg">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-brand-navy truncate">{fullName}</p>
          {agent.phoneNumber && (
            <a
              href={`tel:${agent.phoneNumber}`}
              className="flex items-center gap-1 text-sm text-brand-blue hover:underline mt-0.5"
            >
              <Phone className="w-3.5 h-3.5" />
              {agent.phoneNumber}
            </a>
          )}
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-1 text-xs text-gray-500 hover:underline mt-0.5 truncate"
            >
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{agent.email}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
