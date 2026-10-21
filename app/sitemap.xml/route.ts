import { brandAssets, heroSlides, site } from "@/config/site";
import { aboutImages, galleryImages } from "@/config/gallery";

/**
 * XML sitemap served at /sitemap.xml (written out as a static file on build).
 * Single-page site: the homepage is the only indexable URL (the nav items are
 * in-page anchors, not separate routes). Its photos are listed with the
 * Google image-sitemap extension so they can show up in Google Images.
 * Submit https://<domain>/sitemap.xml in Google Search Console.
 */
export const dynamic = "force-static";

const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${site.url}${path}`);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const photos = [
    { src: brandAssets.ogImage, title: site.fullName },
    ...heroSlides.map((s) => ({ src: s.src, title: s.alt })),
    ...aboutImages.map((a) => ({ src: a.src, title: a.alt })),
    ...galleryImages.map((g) => ({ src: g.src, title: g.caption ?? g.alt })),
  ];
  const seen = new Set<string>();
  const images = photos
    .filter((p) => !seen.has(p.src) && seen.add(p.src))
    .map((p) => `    <image:image>\n      <image:loc>${esc(abs(p.src))}</image:loc>\n      <image:title>${esc(p.title)}</image:title>\n    </image:image>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${esc(site.url)}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
${images}
  </url>
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
