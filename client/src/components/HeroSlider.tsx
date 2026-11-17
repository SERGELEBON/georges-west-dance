import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { HeroSlide } from "@shared/siteContent";
import { useI18n } from "@/i18n";

const MOBILE_QUERY = "(max-width: 768px) and (orientation: portrait)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * Full-screen hero carousel.
 * - Videos advance when they end; images after `duration` seconds.
 * - Phones in portrait get `mobileSrc` (a vertical cut) when provided.
 * - `fit: "blur"` keeps a vertical/odd-ratio video entirely visible over a blurred
 *   copy of its poster, instead of cropping it.
 * - Only the active video plays; the next one preloads its metadata.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const { t } = useI18n();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const count = slides.length;
  const current = slides[Math.min(active, count - 1)];

  const goTo = useCallback((index: number) => {
    setProgress(0);
    setActive(((index % count) + count) % count);
  }, [count]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => { if (active >= count) setActive(0); }, [active, count]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);

  // Play the active video, pause/rewind the others.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && playing) {
        // AbortError just means the source changed mid-load; only a real autoplay block stops the carousel.
        video.play().catch(error => { if (error?.name === "NotAllowedError") setPlaying(false); });
      } else {
        video.pause();
        if (index !== active) video.currentTime = 0;
      }
    });
  }, [active, playing, isMobile]);

  // Image slides advance on a timer.
  useEffect(() => {
    if (!current || current.type !== "image" || !playing || count < 2) return;
    const started = Date.now();
    const total = current.duration * 1000;
    const timer = window.setInterval(() => {
      const ratio = (Date.now() - started) / total;
      setProgress(Math.min(1, ratio));
      if (ratio >= 1) next();
    }, 200);
    return () => window.clearInterval(timer);
  }, [current, playing, count, next]);

  const toggle = () => setPlaying(p => !p);

  if (!current) return null;
  const label = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <div className="hero-slides" aria-roledescription="carousel" aria-label={t("Featured films")}>
        {slides.map((slide, index) => {
          const isActive = index === active;
          const src = isMobile && slide.mobileSrc ? slide.mobileSrc : slide.src;
          const shouldLoad = isActive || index === (active + 1) % count;
          const media = slide.type === "video" ? (
            <video
              key={src}
              ref={el => { videoRefs.current[index] = el; }}
              className="hero-media"
              poster={slide.poster || undefined}
              muted
              playsInline
              loop={count === 1}
              preload={isActive ? "auto" : shouldLoad ? "metadata" : "none"}
              aria-label={slide.alt}
              onEnded={() => count > 1 && next()}
              onCanPlay={e => { if (isActive && playing && e.currentTarget.paused) e.currentTarget.play().catch(() => undefined); }}
              onTimeUpdate={e => {
                if (!isActive) return;
                const v = e.currentTarget;
                if (v.duration) setProgress(v.currentTime / v.duration);
              }}
            >
              {shouldLoad && <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} onError={() => { if (isActive && count > 1) window.setTimeout(next, 1500); }} />}
            </video>
          ) : (
            <img className="hero-media" src={src} alt={slide.alt} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
          );
          return (
            <div
              key={slide.id}
              className={`hero-slide hero-slide--${slide.fit} ${slide.grayscale ? "is-mono" : ""} ${isActive ? "is-active" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${count}`}
              aria-hidden={!isActive}
            >
              {slide.fit === "blur" && <div className="hero-backdrop" style={slide.poster ? { backgroundImage: `url("${encodeURI(slide.poster)}")` } : undefined} aria-hidden="true" />}
              {media}
            </div>
          );
        })}
      </div>
      <div className="hero-shade" />
      <div className="hero-footer">
        <span>{label(active + 1)} / {label(count)}</span>
        <span className="hero-progress"><i style={{ transform: `scaleX(${progress})` }} /></span>
        {count > 1 && (
          <span className="hero-arrows">
            <button type="button" onClick={() => goTo(active - 1)} aria-label={t("Previous slide")}><ChevronLeft size={15} /></button>
            <button type="button" onClick={() => goTo(active + 1)} aria-label={t("Next slide")}><ChevronRight size={15} /></button>
          </span>
        )}
        <button className="video-control" type="button" onClick={toggle} aria-label={playing ? t("Pause hero video") : t("Play hero video")}>
          {playing ? <><Pause size={13} /> {t("Pause film")}</> : <><Play size={13} /> {t("Play film")}</>}
        </button>
        <span className="hero-dots">
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" className={index === active ? "is-active" : ""} onClick={() => goTo(index)} aria-label={`${t("Go to slide")} ${index + 1}`} aria-current={index === active} />
          ))}
        </span>
      </div>
    </>
  );
}
