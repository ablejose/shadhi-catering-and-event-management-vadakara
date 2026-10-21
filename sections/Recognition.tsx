"use client";

import { useState } from "react";
import { Award, Maximize2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Img } from "@/components/ui/Img";
import Lightbox from "@/components/Lightbox";
import { event } from "@/event.config";
import { asset } from "@/lib/copy";

/**
 * RECOGNITION — a small strip of their own press / award clippings. Thumbnails
 * stay small on the page; tap one to read the full clipping in the lightbox.
 * Renders nothing when the event has no `recognition`.
 */
export default function Recognition() {
  const r = event.recognition;
  const [active, setActive] = useState<number | null>(null);
  if (!r || r.items.length === 0) return null;

  const since = event.brand.foundedYear;
  const years = since ? new Date().getFullYear() - since : undefined;
  const full = r.items.map((it) => ({ src: asset(it.src), alt: `${it.title} — ${it.source}`, caption: `${it.title} · ${it.source}${it.date ? `, ${it.date}` : ""}` }));

  return (
    <section id="recognition" aria-labelledby="recognition-heading" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-shell px-6">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">Recognition{since ? ` · Since ${since}` : ""}</p>
            <h2 id="recognition-heading" className="display mt-4" style={{ fontSize: "clamp(1.7rem, 3vw, 2.5rem)" }}>
              {r.heading}
            </h2>
            {r.body && <p className="body-copy mt-4 max-w-md">{r.body}</p>}
            {years !== undefined && years > 0 && (
              <p className="mt-6 inline-flex items-baseline gap-2 rounded-full bg-[var(--saffron-soft)] px-4 py-2 font-sans text-sm text-espresso">
                <span className="font-display text-2xl leading-none text-saffron-2">{years}</span> years of weddings &amp; events
              </p>
            )}
          </Reveal>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {r.items.map((it, i) => (
              <Reveal as="li" key={it.src} delay={i * 0.06}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Open clipping: ${it.title}`}
                  className="group flex h-full w-full items-start gap-4 rounded-brand border border-sand bg-cream/60 p-3 text-left transition-colors duration-300 hover:border-saffron/60"
                >
                  <span className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-sand ring-1 ring-sand">
                    <Img src={asset(it.thumb ?? it.src)} alt={it.title} className="h-full w-full object-cover object-top" />
                    <span className="pointer-events-none absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-ivory/90 text-espresso">
                      <Maximize2 size={11} />
                    </span>
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="flex items-center gap-1.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-saffron-2">
                      <Award size={12} /> {it.source}
                    </span>
                    <span className="mt-1 block font-display text-[1.02rem] leading-snug text-espresso">{it.title}</span>
                    {it.note && <span className="mt-1 block font-sans text-[0.8rem] leading-relaxed text-muted">{it.note}</span>}
                    {it.date && <span className="mt-1 block font-sans text-[0.72rem] text-muted">{it.date}</span>}
                  </span>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      <Lightbox items={full} index={active} onClose={() => setActive(null)} onNav={setActive} />
    </section>
  );
}
