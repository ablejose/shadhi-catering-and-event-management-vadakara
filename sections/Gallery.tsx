"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Maximize2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Img } from "@/components/ui/Img";
import Lightbox from "@/components/Lightbox";
import { galleryImages, type GalleryItem } from "@/config/gallery";
import { copy } from "@/config/site";
import { t } from "@/lib/copy";
import { cn } from "@/lib/utils";

/** Photos shown before "Show all" in an ungrouped gallery — one full collage block. */
const INITIAL = 8;

/**
 * Collage tile shapes (the grid packs densely, so small tiles drop into gaps).
 *
 * EIGHT, repeating: on 4 columns a clean 4x4 block — tall, tall, big | wide, tall,
 * tall, small, small. On 2 columns the heights stagger like a pinned collage.
 * SIX: big, tall, tall | wide, small, small — a 4x3 block, or 6 rows on phones.
 * TWO: two big tiles side by side (stacked on phones).
 * Edges stay flush in every case.
 */
const EIGHT = [
  "row-span-3 md:row-span-2",
  "row-span-2",
  "col-span-2 row-span-2",
  "col-span-2",
  "row-span-2",
  "row-span-3 md:row-span-2",
  "",
  "",
];
const SIX = ["col-span-2 row-span-2", "row-span-2", "row-span-2", "col-span-2", "", ""];
const TWO = ["col-span-2 row-span-2", "col-span-2 row-span-2"];

const tilesFor = (n: number) => (n === 2 ? TWO : n === 6 ? SIX : EIGHT);

/**
 * OUR WORK — the client's own photos as a collage of tall, big and wide tiles.
 * Photos with a `group` are sorted into tabs (décor, food, team…), one collage
 * per tab. Tap any photo for the full-size lightbox (uncropped).
 */
export default function Gallery() {
  const groups = useMemo(() => {
    const order: string[] = [];
    const by: Record<string, GalleryItem[]> = {};
    galleryImages.forEach((g) => {
      const key = g.group ?? "";
      if (!by[key]) {
        by[key] = [];
        order.push(key);
      }
      by[key].push(g);
    });
    return order.map((name) => ({ name, items: by[name] }));
  }, []);
  const tabbed = groups.length > 1 && groups.every((g) => g.name);

  const [tab, setTab] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  if (galleryImages.length === 0) return null;

  const items = tabbed ? groups[tab].items : galleryImages;
  const shown = tabbed || all ? items : items.slice(0, INITIAL);
  const more = tabbed ? 0 : items.length - INITIAL;
  const tiles = tilesFor(shown.length);

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-shell px-6">
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">{copy.gallery.eyebrow}</p>
            <h2 id="gallery-heading" className="display mt-4" style={{ fontSize: "clamp(2rem, 3.8vw, 3.2rem)" }}>
              {copy.gallery.heading}
            </h2>
            <p className="body-copy mt-4 max-w-xl">{t(copy.gallery.body)}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <blockquote className="display border-l border-saffron/50 pl-6 italic text-espresso/85" style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)" }}>
              &ldquo;{t(copy.gallery.photoQuote)}&rdquo;
            </blockquote>
          </Reveal>
        </div>

        {tabbed && (
          <div
            role="tablist"
            aria-label="Photo categories"
            data-lenis-prevent
            className="-mx-6 mt-10 flex gap-2 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {groups.map((g, i) => (
              <button
                key={g.name}
                type="button"
                role="tab"
                aria-selected={i === tab}
                aria-controls="gallery-panel"
                onClick={() => {
                  setTab(i);
                  setActive(null);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 font-sans text-[0.8rem] font-semibold transition-colors",
                  i === tab ? "border-espresso bg-espresso text-ivory" : "border-sand bg-white text-espresso"
                )}
              >
                {g.name}
                <span className={cn("ml-1.5 font-normal", i === tab ? "text-ivory/55" : "text-muted")}>{g.items.length}</span>
              </button>
            ))}
          </div>
        )}

        <div className={cn("relative", tabbed ? "mt-6" : "mt-12")}>
          <div
            key={tabbed ? groups[tab].name : "all"}
            id="gallery-panel"
            role={tabbed ? "tabpanel" : undefined}
            className="grid grid-flow-row-dense auto-rows-[118px] grid-cols-2 gap-3 sm:auto-rows-[170px] md:auto-rows-[230px] md:grid-cols-4 md:gap-5 lg:auto-rows-[260px]"
          >
            {shown.map((item, i) => (
              <Reveal key={item.src} delay={(i % 4) * 0.06} className={tiles[i % tiles.length]}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Open photo: ${item.alt}`}
                  className="group relative block h-full w-full overflow-hidden rounded-brand bg-sand"
                >
                  <Img
                    src={item.src}
                    alt={item.alt}
                    fallbackSeed={item.src}
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/0 to-ink/0 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                  {item.caption && (
                    // Phones: tiles are too small for a caption over the photo; it shows in the lightbox instead.
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden p-4 text-left font-sans text-sm font-medium text-ivory md:block">
                      {item.caption}
                    </span>
                  )}
                  <span className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ivory/85 text-espresso opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Maximize2 size={15} />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          {!all && more > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream via-cream/80 to-transparent" />
          )}
        </div>

        {more > 0 && (
          <div className="relative mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-espresso/20 bg-white px-6 py-3 font-sans text-sm font-medium text-espresso transition-colors duration-300 hover:border-saffron"
            >
              {all ? copy.gallery.showLess : copy.gallery.showAll.replace("{count}", String(galleryImages.length))}
              <ChevronDown size={16} className={all ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
          </div>
        )}
      </div>

      <Lightbox items={shown} index={active} onClose={() => setActive(null)} onNav={setActive} />
    </section>
  );
}
