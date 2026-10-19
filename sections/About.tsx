"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Clock, Truck, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Img } from "@/components/ui/Img";
import { copy, event, site, withoutDelivery } from "@/config/site";
import { aboutImages, aboutVideo, gallerySettings } from "@/config/gallery";
import { t, tAll } from "@/lib/copy";

const POINT_ICONS = [Clock, Truck, MapPin];

export default function About() {
  const points = [
    // Only claim a rating when there is one.
    ...(site.reviews ? [{ icon: Star, text: `${site.rating.toFixed(1)}\u2605 on Google (${site.reviews} reviews)` }] : []),
    ...withoutDelivery(tAll(copy.about.points)).map((text, i) => ({ icon: POINT_ICONS[i % POINT_ICONS.length], text })),
  ];

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (aboutVideo || aboutImages.length < 2) return;
    const ms = gallerySettings.aboutIntervalMs;
    const timer = setInterval(() => setIdx((i) => (i + 1) % aboutImages.length), ms);
    return () => clearInterval(timer);
  }, []);

  const body = t(event.overrides?.aboutBody ?? copy.about.body);

  return (
    <section id="about" aria-labelledby="about-heading" className="bg-cream py-16 md:py-24">
      <div className="mx-auto grid max-w-shell grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="eyebrow">{copy.about.eyebrow}</p>
            <h2 id="about-heading" className="display mt-4" style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)" }}>
              {copy.about.headingLead}{" "}
              <span className="italic" style={{ color: "var(--saffron)" }}>
                {copy.about.headingAccent}
              </span>
            </h2>
            <span className="my-5 block h-px w-16" style={{ background: "var(--saffron)" }} />
            <p className="body-copy">{body}</p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {points.map((p) => (
                <li key={p.text} className="flex items-center gap-3 font-sans text-sm text-ink/85">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--saffron-soft)] text-saffron-2">
                    <p.icon size={16} />
                  </span>
                  {p.text}
                </li>
              ))}
            </ul>
            {site.reviews > 0 && (
              <a
                href={site.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-6 inline-flex items-center gap-2 font-sans text-sm font-medium text-espresso"
              >
                <Star size={15} className="fill-saffron text-saffron" /> {t(copy.about.reviewsLink)}
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="relative overflow-hidden rounded-brand bg-sand" style={{ aspectRatio: "4 / 5" }}>
            {aboutVideo ? (
              <AboutVideo src={aboutVideo.src} poster={aboutVideo.poster} label={aboutVideo.alt} />
            ) : (
              aboutImages.map((im, i) => (
              <Img
                key={im.src}
                src={im.src}
                alt={im.alt}
                fallbackSeed={im.src}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: i === idx ? 1 : 0, transition: "opacity 0.8s ease-in-out" }}
              />
              ))
            )}
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Muted looping clip. Nothing downloads until it's near the screen (poster shows
 * first); it pauses when scrolled away, and stays on the poster for reduced motion.
 */
function AboutVideo({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="none"
      aria-label={label}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
