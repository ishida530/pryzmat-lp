import { MapPin } from "lucide-react";

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export function ListingMap({ lat, lng, title }: Props) {
  const delta = 0.006;
  const bbox  = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src   = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const link  = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
      <h2 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-brand-blue" />
        Lokalizacja
      </h2>
      <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
        <iframe
          src={src}
          title={`Mapa lokalizacji: ${title}`}
          className="w-full h-full"
          loading="lazy"
        />
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-blue text-sm hover:underline mt-2 inline-block"
      >
        Otwórz w OpenStreetMap →
      </a>
    </div>
  );
}
