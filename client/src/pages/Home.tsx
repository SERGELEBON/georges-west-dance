// Style direction: warm editorial (ivory / espresso / bronze) inspired by afroritmara.com — cinematic hero carousel, poster typography.
// Every text, image, video and event below comes from the admin-editable content (shared/siteContent.ts).
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Globe2, Instagram, Linkedin, Menu, MessageCircle, Play, Sparkles, X, Youtube } from "lucide-react";
import { toast } from "sonner";
import { BookingDialog } from "@/components/BookingDialog";
import { HeroSlider } from "@/components/HeroSlider";
import { LANGUAGES, useI18n } from "@/i18n";
import { useSiteContent } from "@/lib/content";
import type { SiteEvent } from "@shared/siteContent";

const LAB_ASSETS = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/NQtYZFgGgHYRjyXB.jpg",
  studio: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/TOGzPmbRfJrFgJHK.jpg",
  performance: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/aRfxREyYmFddmovj.jpg",
  storyOne: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/kATOYSuDIxeTDKQW.jpg",
  storyTwo: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/eErYVxwXjCKwWkHs.jpg",
  storyThree: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/jckbMrnPJKdzOFZk.jpg",
};

const navItems = [
  { label: "Classes", id: "classes" },
  { label: "George", id: "george" },
  { label: "Events", id: "events" },
  { label: "Portfolio", id: "portfolio" },
  { label: "Booking", id: "booking" },
  { label: "Contact", id: "contact" },
];
const prompts = {
  portrait: "A striking editorial portrait of a dancer, natural light, deep warm shadows, ivory highlights, subtle film grain.",
  duo: "Two adult dancers in a dynamic partner pose, fine-art photography, generous negative space, Ghanaian studio atmosphere.",
  movement: "An expressive dancer captured mid-motion, sharp silhouette, sculptural lighting, contemporary dance magazine composition.",
};

const storyVisuals = [
  { image: LAB_ASSETS.storyOne, index: "01", alt: "Editorial movement study with two contemporary dancers" },
  { image: LAB_ASSETS.storyTwo, index: "02", alt: "Editorial movement study in a sunlit dance studio" },
  { image: LAB_ASSETS.storyThree, index: "03", alt: "Editorial detail of dancers marking rhythm" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const isExternal = (url: string) => url.startsWith("https://");

function TestimonialRail() {
  const { t } = useI18n();
  const railRef = useRef<HTMLDivElement>(null);

  const moveRail = (direction: "next" | "previous") => {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector<HTMLElement>(".testimonial-card");
    const distance = (firstCard?.offsetWidth || 320) + 18;
    rail.scrollBy({ left: direction === "next" ? distance : -distance, behavior: "smooth" });
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => moveRail("next"), 5200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="testimonial-rail-wrap">
      <div className="testimonial-rail" ref={railRef} aria-label="Editorial testimonial story slots">
        {storyVisuals.map((story) => (
          <article className="testimonial-card" key={story.index}>
            <div className="testimonial-card-image"><img src={story.image} alt={story.alt} loading="lazy" /><span>Editorial visual / {story.index}</span></div>
            <div className="testimonial-card-copy"><span className="footer-label">Verified story slot {story.index}</span><h3>Real voice<br /><i>to be added.</i></h3><p>This space is reserved for an authentic dancer’s words and photograph. No invented reviews, only experiences shared with permission.</p><a href="#contact" className="line-button">Share a story <ArrowRight size={15} /></a></div>
          </article>
        ))}
      </div>
      <div className="testimonial-controls"><span>{t("Slide left to right")}</span><div><button type="button" onClick={() => moveRail("previous")} aria-label="Previous testimonial story slot"><ChevronLeft size={17} /></button><button type="button" onClick={() => moveRail("next")} aria-label="Next testimonial story slot"><ChevronRight size={17} /></button></div></div>
    </div>
  );
}

function EventCard({ event, whatsapp, onPoster }: { event: SiteEvent; whatsapp: string; onPoster: (event: SiteEvent) => void }) {
  const { t } = useI18n();
  const cta = event.ctaUrl || whatsapp;
  return (
    <article className="event-feature">
      {event.poster && <div className="event-poster"><button type="button" className="event-poster-trigger" onClick={() => onPoster(event)} aria-label={`View the ${event.titleLine1} poster full size`}><img src={event.poster} alt={event.posterAlt} loading="lazy" /><span className="image-tag">View poster</span></button></div>}
      <div className="event-details">
        <div className="event-kicker">{event.status && <span className="event-status">{t(event.status)}</span>}<span>{t(event.schedule)}</span></div>
        <h3>{t(event.titleLine1)}<br /><i>{t(event.titleLine2)}</i></h3>
        <p className="event-intro">{event.intro}</p>
        {event.facts.length > 0 && <dl className="event-facts">{event.facts.map((fact, i) => <div key={`${fact.label}-${i}`}><dt>{t(fact.label)}</dt><dd>{fact.value}<br /><span>{t(fact.sub)}</span></dd></div>)}</dl>}
        <div className="event-actions"><a className="gold-button" href={cta} target="_blank" rel="noopener noreferrer">{t("Ask about this event")} <MessageCircle size={16} /></a><a className="line-button" href={whatsapp} target="_blank" rel="noopener noreferrer">{t("WhatsApp the studio")} <ArrowRight size={15} /></a></div>
        {event.note && <p className="event-note">{event.note}</p>}
      </div>
    </article>
  );
}

export default function Home() {
  const { content, whatsapp } = useSiteContent();
  const { hero, about, george, trust, events, programs, portfolio, booking, contact, brand, sections } = content;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const [subject, setSubject] = useState<keyof typeof prompts>("portrait");
  const [mood, setMood] = useState("Quiet intensity");
  const [generated, setGenerated] = useState(false);
  const [posterEvent, setPosterEvent] = useState<SiteEvent | null>(null);
  const publishedEvents = events.items.filter(e => e.published);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 56);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!posterEvent) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPosterEvent(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [posterEvent]);

  const currentPrompt = useMemo(() => `${prompts[subject]} Mood: ${mood}.`, [subject, mood]);
  const notify = (message: string) => toast(message, { style: { background: "#201c18", color: "#fbf7f0", border: "1px solid #c4a272" } });
  const generate = () => { setGenerated(true); notify(t("Your composition is ready.")); };
  const visibleNav = navItems.filter(item => (item.id === "george" ? sections.george : item.id === "events" ? sections.events && publishedEvents.length > 0 : true));

  return (
    <div className="site-shell">
      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with Georges West Dance on WhatsApp"><MessageCircle size={22} /><span>WhatsApp</span></a>
      <div className="language-strip"><span>GWD / STUDIO NOTES 01</span><span>{brand.announcement} · <button onClick={() => scrollToId("booking")}>{t("View availability →")}</button></span><span>{t("English")} <ChevronDown size={14} /></span></div>
      <main id="top">
        <section className="hero-section" aria-label="Georges West Dance hero">
          <HeroSlider slides={hero.slides} />
          <header className={`site-header ${isScrolled ? "site-header--compact" : ""}`}>
            <a href="#top" className="brand" aria-label="Georges West Dance home"><img src={brand.logo} alt="Georges West Dance logo" /></a>
            <nav className="desktop-nav">{visibleNav.map((item) => <button key={item.id} onClick={() => scrollToId(item.id)}>{t(item.label)}</button>)}</nav>
            <div className="header-actions"><select value={language} onChange={(e) => setLanguage(e.target.value as (typeof LANGUAGES)[number])} aria-label="Choose language">{LANGUAGES.map((code) => <option key={code}>{code}</option>)}</select><BookingDialog activity="General class enquiry"><button className="gold-button header-cta" type="button">{t("Book a class")} <ArrowRight size={15} /></button></BookingDialog><button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? "Close navigation" : "Open navigation"}>{mobileOpen ? <X /> : <Menu />}</button></div>
          </header>
          <div className={`mobile-nav-backdrop ${mobileOpen ? "is-open" : ""}`} aria-hidden="true" onClick={() => setMobileOpen(false)} />
          <aside id="mobile-navigation" className={`mobile-drawer ${mobileOpen ? "is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
            <div className="mobile-drawer-top"><span>GWD / NAVIGATION</span><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
            <nav>{visibleNav.map((item, index) => <button key={item.id} onClick={() => { setMobileOpen(false); scrollToId(item.id); }}><span>0{index + 1}</span>{t(item.label)}<ArrowRight size={16} /></button>)}</nav>
            <BookingDialog activity="General class enquiry"><button className="gold-button mobile-drawer-cta" type="button" onClick={() => setMobileOpen(false)}>{t("Book a class")} <ArrowRight size={15} /></button></BookingDialog>
            <p className="mobile-drawer-note">{contact.location}<br />{t(about.eyebrow)}</p>
          </aside>
          <div className="hero-content"><p className="eyebrow"><span className="gold-dot" /> {t(hero.eyebrow)}</p><h1>{t(hero.titleLine1)}<br /><i>{t(hero.titleLine2)}</i></h1><p className="hero-lede">{t(hero.lede)}</p><div className="hero-ctas"><BookingDialog activity="General class enquiry"><button className="gold-button" type="button">{t(hero.primaryCta)} <ArrowRight size={17} /></button></BookingDialog><button className="text-button light-button" onClick={() => scrollToId("portfolio")}><span className="play-icon"><Play size={11} fill="currentColor" /></span> {t(hero.secondaryCta)}</button></div></div>
          <div className="hero-emblem"><img src={brand.logo} alt="" /><span>GWD / FILMS</span></div>
        </section>

        <section className="intro-section" id="about"><div className="section-number">01</div><div className="intro-statement"><p className="eyebrow">{t(about.eyebrow)}</p><h2>{t(about.titleLine1)}<br /><span>{t(about.titleLine2)}</span></h2></div><div className="intro-body"><p>{about.body}</p>{sections.george && <button className="line-button" onClick={() => scrollToId("george")}>{t("Meet Georges")} <ArrowRight size={15} /></button>}</div><div className="stat-row">{about.stats.map((stat, i) => <div key={`${stat.label}-${i}`}><strong>{stat.value}</strong><span>{t(stat.label)}</span></div>)}</div></section>

        {sections.george && (
          <section className="george-section" id="george" aria-labelledby="george-title">
            <div className="george-photo">{george.photo && <img src={george.photo} alt={george.photoAlt} loading="lazy" />}<span className="image-tag">{george.name}</span></div>
            <div className="george-copy">
              <p className="eyebrow">02 / {t(george.eyebrow)}</p>
              <h2 id="george-title">{george.name}</h2>
              <p className="george-headline">{george.headline}</p>
              <p className="george-bio">{george.bio}</p>
              {george.languages.length > 0 && <div className="george-languages"><span className="footer-label"><Globe2 size={13} /> {t(george.languagesTitle)}</span><ul>{george.languages.map(lang => <li key={lang}>{lang}</li>)}</ul></div>}
              {george.experience.length > 0 && <div className="george-experience"><span className="footer-label">{t(george.experienceTitle)}</span>{george.experience.map((item, i) => <article key={`${item.role}-${i}`}><div><h3>{item.role}</h3><span>{item.org}</span></div><time>{item.period}</time><p>{item.description}</p></article>)}</div>}
              {george.skills.length > 0 && <ul className="george-skills">{george.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>}
              <div className="george-actions"><BookingDialog activity="Class with George"><button className="dark-button" type="button">{t("Book a class with George")} <CalendarDays size={16} /></button></BookingDialog>{contact.linkedinUrl && <a className="line-button" href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin size={15} /> LinkedIn <ArrowRight size={14} /></a>}</div>
            </div>
          </section>
        )}

        {sections.trust && <section className="trust-section" aria-label="Studio proof"><div className="trust-heading"><p className="eyebrow">{t(trust.eyebrow)}</p><h2>{t(trust.titleLine1)}<br /><i>{t(trust.titleLine2)}</i></h2></div><div className="trust-proof-grid">{trust.proofs.map((proof, i) => <div className="trust-proof" key={`${proof.label}-${i}`}><strong>{proof.value}</strong><span>{t(proof.label)}</span><p>{proof.text}</p></div>)}{sections.testimonials && <div className="trust-notes"><span className="footer-label">Client notes</span><h3>Real voices<br />belong here.</h3><p>Share verified feedback from your dancers to complete this space. No invented reviews, only real experiences.</p><button className="line-button" onClick={() => scrollToId("voices")}>View the story slots <ArrowRight size={15} /></button></div>}</div></section>}

        {sections.events && publishedEvents.length > 0 && <section className="events-section" id="events" aria-labelledby="events-title"><div className="events-heading"><p className="eyebrow">03 / {t(events.eyebrow)}</p><h2 id="events-title">{t(events.titleLine1)}<br /><i>{t(events.titleLine2)}</i></h2><p>{events.intro}</p></div><div className="events-list">{publishedEvents.map(event => <EventCard key={event.id} event={event} whatsapp={whatsapp} onPoster={setPosterEvent} />)}</div><div className={`event-lightbox ${posterEvent ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Event poster" aria-hidden={!posterEvent} onClick={() => setPosterEvent(null)}><div className="event-lightbox-inner" onClick={(event) => event.stopPropagation()}><button type="button" className="event-lightbox-close" onClick={() => setPosterEvent(null)} aria-label="Close event poster"><X size={20} /></button>{posterEvent && <img src={posterEvent.poster} alt={`${posterEvent.posterAlt}, full size`} />}</div></div></section>}

        {sections.lab && <section className="lab-section" id="lab"><div className="lab-heading"><div><p className="eyebrow">{t("The monochrome image lab")}</p><h2>{t("Put a face")}<br /><i>{t("to the feeling.")}</i></h2></div><p>Create a visual study of the dancer you are becoming. Choose a subject, set an atmosphere and compose a portrait rooted in movement.</p></div><div className="lab-grid"><div className="lab-controls"><div className="control-group"><label>01 / Subject</label><div className="choice-list">{([['portrait', 'Solo portrait'], ['duo', 'Dance partners'], ['movement', 'In motion']] as const).map(([value, label]) => <button className={subject === value ? "choice active" : "choice"} onClick={() => setSubject(value)} key={value}><span>{t(label)}</span>{subject === value && <Check size={15} />}</button>)}</div></div><div className="control-group"><label>02 / Atmosphere</label><select className="wide-select" value={mood} onChange={(e) => setMood(e.target.value)}><option>Quiet intensity</option><option>Sunlit confidence</option><option>After-hours energy</option><option>Soft focus</option></select></div><button className="generate-button" onClick={generate}><Sparkles size={17} /> {t("Generate image")} <ArrowRight size={17} /></button><p className="tiny-note">A creative concept preview · No account required</p></div><div className="result-frame">{generated ? <><img src={subject === "portrait" ? LAB_ASSETS.studio : subject === "duo" ? LAB_ASSETS.hero : LAB_ASSETS.performance} alt="Generated dance composition" /><div className="result-overlay"><span>GWD / IMAGE LAB</span><strong>COMPOSITION<br />READY</strong><button onClick={() => navigator.clipboard?.writeText(currentPrompt).then(() => notify(t("Prompt copied to clipboard.")))}>Copy prompt →</button></div></> : <div className="empty-result"><div className="empty-symbol">✳</div><p>Select a subject.<br />We’ll start from there.</p><span>YOUR RESULT WILL APPEAR HERE</span></div>}<div className="frame-corner tl" /><div className="frame-corner br" /></div></div></section>}

        {sections.programs && <section className="program-section" id="classes"><div className="section-topline"><p className="eyebrow">{t(programs.eyebrow)}</p><button className="line-button" onClick={() => notify(t("All class formats are available by enquiry."))}>{t("View all classes")} <ArrowRight size={15} /></button></div><div className="program-list">{programs.rows.map((row, i) => <a className="program-row" href={row.href || "#booking"} key={`${row.title}-${i}`} {...(isExternal(row.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span className="program-no">{String(i + 1).padStart(2, "0")}</span><div><h3>{t(row.title)}</h3><p>{row.description}</p></div><ArrowDownRight /></a>)}</div></section>}

        {sections.portfolio && <section className="portfolio-section" id="portfolio"><div className="portfolio-image"><img src={portfolio.image} alt={portfolio.imageAlt} loading="lazy" />{contact.youtubeUrl && <a className="round-play" href={contact.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Georges West Dance on YouTube"><Play size={19} fill="currentColor" /></a>}<span className="image-tag">Performance archive</span></div><div className="portfolio-copy"><p className="eyebrow">{t(portfolio.eyebrow)}</p><h2>{t(portfolio.titleLine1)}<br /><i>{t(portfolio.titleLine2)}</i></h2><p>{portfolio.text}</p>{contact.youtubeUrl ? <a className="gold-button" href={contact.youtubeUrl} target="_blank" rel="noopener noreferrer">{t("Explore portfolio")} <ArrowRight size={17} /></a> : <button className="gold-button" onClick={() => notify(t("The full portfolio is being curated."))}>{t("Explore portfolio")} <ArrowRight size={17} /></button>}{contact.youtubeUrl && <a className="youtube-link" href={contact.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube size={15} /> Watch on YouTube <ArrowRight size={14} /></a>}<div className="portfolio-counter"><strong>{portfolio.chapters}</strong><span>chapters<br />in the archive</span></div></div></section>}

        {sections.booking && <section className="booking-section" id="booking"><div className="booking-mark"><img src={brand.logo} alt="" /><span>↘</span></div><div><p className="eyebrow">{t(booking.eyebrow)}</p><h2>{t(booking.titleLine1)}<br /><i>{t(booking.titleLine2)}</i></h2></div><div className="booking-copy"><p>{booking.text}</p><BookingDialog activity="General class enquiry"><button className="dark-button" type="button">{t("Start a booking")} <CalendarDays size={16} /></button></BookingDialog><span>{contact.phone}</span></div></section>}

        {sections.newsletter && <section className="contact-section" id="contact"><div><p className="eyebrow">{t("Stay in the rhythm")}</p><h2>{t("Notes from")}<br /><i>{t("the studio.")}</i></h2></div><form onSubmit={(e) => { e.preventDefault(); notify(t("You’re on the list.")); }}><label htmlFor="email">Receive occasional studio news, new session dates and work in progress.</label><div className="email-row"><input id="email" type="email" placeholder="Your email address" required maxLength={200} autoComplete="email" /><button aria-label="Subscribe"><ArrowRight /></button></div></form></section>}

        {sections.testimonials && <section className="testimonials-section" id="voices"><div className="testimonials-heading"><div><p className="eyebrow">Stories in motion</p><h2>{t("Real voices")}<br /><i>{t("belong here.")}</i></h2></div><p>Scroll through the editorial story slots below. Once dancers share their verified words and photos with permission, each slot can become a true testimony.</p></div><TestimonialRail /></section>}

      </main>
      <footer id={sections.newsletter ? undefined : "contact"}><div className="footer-top"><div className="footer-brand"><img src={brand.logo} alt="Georges West Dance logo" /><p>{brand.footerTagline}</p></div><div className="footer-links footer-links--compact"><div><span className="footer-label">Explore</span><button onClick={() => scrollToId("classes")}>{t("Classes")}</button><button onClick={() => scrollToId("portfolio")}>{t("Portfolio")}</button><button onClick={() => scrollToId("booking")}>{t("Booking")}</button></div><div><span className="footer-label">Connect</span><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</a>{contact.youtubeUrl && <a href={contact.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube size={14} /> YouTube</a>}{contact.instagramUrl && <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram size={14} /> Instagram</a>}{contact.linkedinUrl && <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin size={14} /> LinkedIn</a>}{contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}<span>{contact.phone}</span></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Georges West Dance</span><span>{contact.location}</span><span>EN · FR · ES · DE · ZH</span></div></footer>
    </div>
  );
}
