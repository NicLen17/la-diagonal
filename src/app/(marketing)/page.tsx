import { Contact } from "@/components/landing/contact";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MapPreview } from "@/components/landing/map-preview";
import { Services } from "@/components/landing/services";
import { SportsGrid } from "@/components/landing/sports-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { TrustBar } from "@/components/landing/trust-bar";
import { getDataAccess } from "@/lib/data";

export default async function HomePage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const courts = (await db.courts.listByVenue(venue.id)).filter(
    (court) => court.isActive,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: venue.name,
    description:
      "Complejo deportivo en Tafí Viejo con canchas de fútbol 5, 7, 9, 11, futsal, handball y pádel.",
    url: "https://ladiagonal.com.ar",
    telephone: `+${venue.phoneE164.replace(/\D/g, "")}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressRegion: venue.province,
      addressCountry: "AR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "00:00",
      },
    ],
    sameAs: [venue.instagramUrl, venue.facebookUrl],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.4",
      reviewCount: "735",
      bestRating: "5",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero venue={venue} />
      <TrustBar venue={venue} />
      <SportsGrid />
      <HowItWorks />
      <MapPreview venue={venue} courts={courts} />
      <Services />
      <Testimonials />
      <Contact venue={venue} />
    </>
  );
}
