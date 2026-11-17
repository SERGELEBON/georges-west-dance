// "Meet us in the room" — one slide per published event.
// Auto-advances (pauses on hover, keyboard focus, hidden tab, off-screen and reduced motion),
// with arrows, numbered tabs + progress bar, swipe on touch and arrow keys.
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { SiteEvent } from "@shared/siteContent";

type Props = {
  events: SiteEvent[];
  autoplaySeconds: number;
  renderSlide: (event: SiteEvent) => ReactNode;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function EventsSlider({ events, autoplaySeconds, renderSlide }: Props) {
  const count = events.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  // Keep the index valid when the admin removes events.
  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Only run while the section is on screen and the tab is visible.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; update(); }, { threshold: 0.35 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  const delay = Math.max(3, autoplaySeconds || 0) * 1000;
  const autoplay = count > 1 && autoplaySeconds > 0 && !reducedMotion;
  const running = autoplay && !hovered && !focused && !userPaused && visible;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(index + 1), delay);
    return () => window.clearTimeout(timer);
  }, [running, index, delay, go]);

  if (count === 0) return null;
  if (count === 1) return <div className="events-list">{renderSlide(events[0])}</div>;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  };
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      ref={root}
      className="events-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Upcoming events"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
      onKeyDown={onKeyDown}
    >
      <div className="events-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="events-track" style={{ transform: `translate3d(-${index * 100}%,0,0)` }}>
          {events.map((event, i) => (
            <div
              key={event.id}
              className={`events-slide ${i === index ? "is-active" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${event.titleLine1} ${event.titleLine2}`.trim()}
              aria-hidden={i !== index}
              inert={i !== index ? true : undefined}
            >
              {renderSlide(event)}
            </div>
          ))}
        </div>
      </div>

      <div className="events-controls">
        <div className="events-counter" aria-live={running ? "off" : "polite"}><strong>{pad(index + 1)}</strong><span>/ {pad(count)}</span></div>
        <div className="events-tabs" role="tablist" aria-label="Choose an event">
          {events.map((event, i) => (
            <button
              key={event.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${event.titleLine1} ${event.titleLine2}`.trim()}
              className={i === index ? "is-active" : ""}
              onClick={() => go(i)}
            >
              <span className="events-tab-label">{event.schedule || event.titleLine1}</span>
              <span className="events-tab-bar">
                <span
                  key={`${index}-${running}`}
                  className={i === index && running ? "is-running" : i === index ? "is-full" : ""}
                  style={i === index && running ? { animationDuration: `${delay}ms` } : undefined}
                />
              </span>
            </button>
          ))}
        </div>
        <div className="events-arrows">
          {autoplay && (
            <button type="button" onClick={() => setUserPaused(p => !p)} aria-label={userPaused ? "Play the events slideshow" : "Pause the events slideshow"}>
              {userPaused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          )}
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous event"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next event"><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
