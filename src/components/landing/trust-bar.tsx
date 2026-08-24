import { CalendarIcon, ClockIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { Venue } from "@/lib/data/types";

function formatPhoneDisplay(phoneE164: string): string {
  const local = phoneE164.replace(/^54/, "0");
  if (local.length >= 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)}-${local.slice(7)}`;
  }
  return phoneE164;
}

const items = [
  {
    icon: CalendarIcon,
    label: "Desde 2017",
    detail: "Impulsando el deporte local",
  },
  {
    icon: MapPinIcon,
    label: "Tafí Viejo",
    detail: "Tucumán, Argentina",
  },
  {
    icon: ClockIcon,
    label: "Hasta 00:00",
    detail: "Abrimos todos los días",
  },
] as const;

export function TrustBar({ venue }: { venue: Venue }) {
  const phoneDisplay = formatPhoneDisplay(venue.phoneE164);

  return (
    <section
      aria-label="Información del complejo"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {items.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-lime-400/15 text-navy-900">
              <Icon className="size-5" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-navy-950">{label}</p>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </div>
          </div>
        ))}

        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-lime-400/15 text-navy-900">
            <PhoneIcon className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-navy-950">Teléfono</p>
            <a
              href={`tel:+${venue.phoneE164.replace(/\D/g, "")}`}
              className="text-sm text-muted-foreground transition hover:text-lime-500"
            >
              {phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
