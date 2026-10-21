/** DERIVED — all SEO / schema.org values, generated from the event config. */
import { event } from "@/event.config";
import { templateCopy } from "@/config/template";
import { t } from "@/lib/copy";
import { brandAssets, site } from "@/config/site";
import { services } from "@/config/services";
import { reviews } from "@/config/reviews";
import { galleryImages } from "@/config/gallery";

const s = templateCopy.seo;
const ev = event.seo;

/** Town names people actually search: the official one plus any alternates ("Vadakara" for "Vatakara"). */
export const placeNames = Array.from(new Set([event.location.city, ...(ev?.altPlaceNames ?? [])]));

export const seo = {
  title: ev?.title ?? t(s.title),
  titleTemplate: t(s.titleTemplate),
  description: ev?.description ?? t(s.description),
  ogDescription: ev?.ogDescription ?? t(s.ogDescription),
  keywords: Array.from(new Set([...s.keywords.map(t), ...(ev?.keywords ?? [])])),
  category: s.category,
  locale: s.locale,
  lang: s.lang,
  googleVerification: ev?.googleVerification ?? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bingVerification: ev?.bingVerification,
};

const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${site.url}${path}`);
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const phones = [site.phone, site.phoneAlt].filter(Boolean) as string[];

/** LocalBusiness + WebSite structured data for the active event (one @graph). */
export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // FoodEstablishment is the closest schema.org type for a caterer; it is a LocalBusiness.
      "@type": ["FoodEstablishment", "LocalBusiness"],
      "@id": `${site.url}/#business`,
      name: site.fullName,
      alternateName: Array.from(new Set([site.name, `${site.name} ${site.kicker}`])),
      description: seo.description,
      slogan: event.brand.headline,
      foundingDate: event.brand.foundedYear ? String(event.brand.foundedYear) : undefined,
      url: `${site.url}/`,
      image: [
        abs(brandAssets.ogImage),
        abs(brandAssets.heroPoster),
        ...galleryImages.slice(0, 8).map((g) => abs(g.src)),
      ],
      logo: abs(`${brandAssets.dir}/android-chrome-512x512.png`),
      telephone: site.phone,
      contactPoint: phones.map((p) => ({
        "@type": "ContactPoint",
        telephone: p,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "ml"],
      })),
      priceRange: s.priceRange,
      currenciesAccepted: s.currency,
      paymentAccepted: s.payment,
      servesCuisine: [...s.cuisines],
      address: {
        "@type": "PostalAddress",
        streetAddress: event.location.street,
        addressLocality: event.location.city,
        addressRegion: event.location.region,
        postalCode: event.location.postalCode,
        addressCountry: event.location.country,
      },
      geo: event.location.geo
        ? { "@type": "GeoCoordinates", latitude: event.location.geo.lat, longitude: event.location.geo.lng }
        : undefined,
      hasMap: site.mapsLink,
      areaServed: Array.from(new Set([...placeNames, ...site.serviceAreas])).map((a) => ({ "@type": "City", name: a })),
      sameAs: [event.web.instagram, event.web.facebook, event.web.youtube, site.mapsLink].filter(Boolean),
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: event.location.openDays ?? ALL_DAYS,
        opens: event.location.opens ?? "09:00",
        closes: event.location.closes ?? "21:00",
      },
      aggregateRating: site.reviews
        ? { "@type": "AggregateRating", ratingValue: site.rating.toFixed(1), reviewCount: String(site.reviews), bestRating: "5" }
        : undefined,
      // Their real Google reviews, quoted as shown on the page.
      review: reviews.length
        ? reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5" },
            reviewBody: r.quote,
          }))
        : undefined,
      makesOffer: services.map((sv) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: sv.title, description: sv.blurb, areaServed: placeNames.join(", ") },
      })),
      knowsAbout: ["Wedding catering", "Event management", "Stage decoration", "Buffet catering", "Live food counters"],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: `${site.url}/`,
      name: site.fullName,
      inLanguage: seo.lang,
      publisher: { "@id": `${site.url}/#business` },
    },
  ],
};
