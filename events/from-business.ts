import type { EventConfig, EventVariant, GalleryEntry, MenuItem, MenuPreset } from "@/config/event-schema";
import { templateMenu, templateMenuPresets, templateServices } from "@/config/template";

/**
 * ONE BUSINESS, AS THE SITE GENERATOR WRITES IT.
 *
 * `scripts/sitegen.mjs` turns each row of the business sheet (plus Google
 * Places data) into one of these and drops it in `events/active.json` before
 * building. Everything not listed here — hero, services, about, menu, copy —
 * comes from the template, so only their own details and their own photos
 * (gallery section only) change from site to site.
 */
export interface BusinessInput {
  slug: string;
  /** Full business name, cleaned (used for SEO + footer). */
  name: string;
  /** Big display word(s) for hero/header/loader. Falls back to `name`. */
  shortName?: string;
  /** Small line under the name, e.g. "Catering & Events". */
  descriptor?: string;
  /** What the business leads with — drives section copy. Defaults to "catering". */
  variant?: EventVariant;
  /** Their own hero line; without it every site shares the template's. */
  headline?: string;
  tagline?: string;

  address: string;
  street?: string;
  area?: string;
  city: string;
  district?: string;
  region?: string;
  postalCode?: string;
  geo?: { lat: number; lng: number };
  mapsLink: string;

  phone: string;
  /** Optional second number, shown beside the main one in the footer. */
  phoneAlt?: string;
  /** wa.me digits, e.g. "919847348699". */
  whatsapp: string;
  email?: string;
  instagram?: string;
  facebook?: string;

  hours?: string;
  opens?: string;
  closes?: string;
  /** Days open for schema.org, e.g. Monday–Saturday. Omit for every day. */
  openDays?: string[];
  /** Nearby towns they serve, on top of city / area / district (footer + schema.org). */
  serviceAreas?: string[];
  /** Their own search wording and Search Console / Bing verification codes. */
  seo?: {
    title?: string;
    description?: string;
    ogDescription?: string;
    keywords?: string[];
    altPlaceNames?: string[];
    googleVerification?: string;
    bingVerification?: string;
  };

  rating?: number;
  reviewCount?: number;
  /** Real Google reviews only. */
  reviews?: { name: string; rating: number; quote: string }[];

  /** Their own photos, relative to /events/<slug>/ — e.g. "gallery/01.jpg", or { src, alt, caption }. */
  gallery: GalleryEntry[];
  /** Their own hero / about / service-card / share photos. Anything left out stays template stock. */
  media?: {
    heroSlides?: GalleryEntry[];
    about?: GalleryEntry[];
    /** Short muted loop for the About section, in place of the about photos. */
    aboutVideo?: { src: string; poster?: string; alt?: string };
    /** One image per shared service card, in order. */
    services?: string[];
    ogImage?: string;
    /** Their own favicon / app-icon folder, relative to /events/<slug>/ (e.g. "brand"). */
    brandDir?: string;
  };

  /** Extra dishes they serve, added to the end of a menu course by its id (e.g. "starters", "sadya", "non-veg"). */
  menuExtras?: Record<string, MenuItem[]>;

  /** Year they started (e.g. 2015). */
  foundedYear?: number;
  /** Their own press / award clippings for the Recognition strip. */
  recognition?: EventConfig["recognition"];

  /** Live site origin, no trailing slash. */
  url: string;
}

/** Template stock used for every generated site (public/template). */
const STOCK = {
  heroSlides: [
    { src: "/template/hero/03.webp", alt: "Banquet hall dressed in white and gold under crystal chandeliers" },
    { src: "/template/hero/01.webp", alt: "Floral wedding mandap with marigold garlands and gold chairs" },
  ],
  about: [
    { src: "/template/placeholders/02.webp", alt: "Wedding buffet spread with gold chafing dishes and florals" },
    { src: "/template/about-fallback.webp", alt: "Bride under fairy lights at an evening celebration" },
  ],
  ogImage: "/template/og-image.jpg",
  brandDir: "/template/brand",
};

/**
 * Generated sites serve businesses of every community, so the shared menu
 * drops dishes not every caterer offers and uses a neutral preset name.
 */
const NEUTRAL_DROP = new Set(["pork-ularthiyathu"]);
const neutralMenu = templateMenu.map((c) => ({ ...c, items: c.items.filter((i) => !NEUTRAL_DROP.has(i.id)) }));
const neutralPresets: MenuPreset[] = templateMenuPresets.map((p) => ({
  ...p,
  title: p.title === "Christian Wedding Feast" ? "Kerala Wedding Feast" : p.title,
  items: p.items.filter((id) => !NEUTRAL_DROP.has(id)),
}));

const srcOf = (e: GalleryEntry) => (typeof e === "string" ? e : e.src);

const uniq = (xs: (string | undefined)[]) => Array.from(new Set(xs.filter((x): x is string => !!x && !!x.trim())));

export function fromBusiness(b: BusinessInput): EventConfig {
  // Unknown district, or district == town (e.g. Kottayam): show the state instead of repeating the town.
  const district = b.district && b.district.toLowerCase() !== b.city.toLowerCase() ? b.district : b.region || "Kerala";
  const descriptor = b.descriptor || "Catering & Events";
  const heroSlides = b.media?.heroSlides?.length ? b.media.heroSlides : STOCK.heroSlides;
  const mapEmbed = b.geo
    ? `https://www.google.com/maps?q=${b.geo.lat},${b.geo.lng}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(`${b.name}, ${b.address}`)}&output=embed`;

  return {
    slug: b.slug,
    variant: b.variant ?? "catering",
    brand: {
      name: b.shortName || b.name,
      fullName: b.name,
      descriptor,
      kicker: descriptor,
      tagline: b.tagline || "Weddings & events, catered with care.",
      headline: b.headline || "Unforgettable feasts. Flawless celebrations.",
      foundedYear: b.foundedYear,
    },
    contact: { phone: b.phone, phoneAlt: b.phoneAlt || undefined, whatsapp: b.whatsapp, email: b.email || undefined },
    location: {
      city: b.city,
      district,
      region: b.region || "Kerala",
      area: b.area || undefined,
      address: b.address,
      street: b.street || b.area || b.city,
      postalCode: b.postalCode || "",
      country: "IN",
      serviceAreas: uniq([b.city, b.area, district, ...(b.serviceAreas ?? [])]),
      geo: b.geo,
      mapsLink: b.mapsLink,
      mapEmbed,
      hours: b.hours || "Call or WhatsApp to book",
      opens: b.opens,
      closes: b.closes,
      openDays: b.openDays,
      delivery: false,
    },
    web: { url: b.url, instagram: b.instagram || undefined, facebook: b.facebook || undefined },
    reputation: { rating: b.rating ?? 0, reviews: b.reviewCount ?? 0 },
    media: {
      base: `/events/${b.slug}`,
      heroPoster: srcOf(heroSlides[0]),
      heroSlides,
      ogImage: b.media?.ogImage || STOCK.ogImage,
      brandDir: b.media?.brandDir || STOCK.brandDir,
      about: b.media?.about?.length ? b.media.about : STOCK.about,
      aboutVideo: b.media?.aboutVideo,
      gallery: b.gallery.map((g, i) =>
        typeof g === "string" ? { src: g, alt: `${b.name} — event photo ${i + 1}` } : { alt: `${b.name} — event photo ${i + 1}`, ...g }
      ),
    },
    reviews: (b.reviews ?? []).map((r) => ({ ...r, source: "Google review" })),
    recognition: b.recognition,
    seo: {
      ...b.seo,
      keywords: uniq([b.name, b.shortName, `${b.shortName || b.name} ${b.city}`, ...(b.seo?.keywords ?? [])]),
    },
    overrides: {
      menu: neutralMenu.map((c) => ({ ...c, items: [...c.items, ...(b.menuExtras?.[c.id] ?? [])] })),
      menuPresets: neutralPresets,
      ...(b.media?.services?.length && {
        services: templateServices.map((s, i) => ({ ...s, image: b.media?.services?.[i] || s.image })),
      }),
    },
  };
}
