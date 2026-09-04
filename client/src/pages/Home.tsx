// Style direction: Galerie Brutaliste Dorée — hero cinématique plein écran, typographie d’affiche, ivoire/charbon, or ghanéen en gestes précis.
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Instagram, Menu, MessageCircle, Pause, Play, Sparkles, X, Youtube } from "lucide-react";
import { toast } from "sonner";
import { BookingDialog } from "@/components/BookingDialog";
import { WHATSAPP_URL } from "@shared/contact";

const ASSETS = {
  mark: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/dKCZczrKpxxCKHmx.jpg",
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/NQtYZFgGgHYRjyXB.jpg",
  studio: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/TOGzPmbRfJrFgJHK.jpg",
  performance: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/aRfxREyYmFddmovj.jpg",
  heroVideo: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/KiffohzpQOodozcD.mp4",
  storyOne: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/kATOYSuDIxeTDKQW.jpg",
  storyTwo: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/eErYVxwXjCKwWkHs.jpg",
  storyThree: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/jckbMrnPJKdzOFZk.jpg",
  eventPoster: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701/qBQRfjkRThHSnihN.jpeg",
};

const navItems = ["Classes", "Portfolio", "Booking", "About", "Contact"];
const prompts = {
  portrait: "A striking black-and-white editorial portrait of a mixed-heritage dancer, natural light, deep charcoal shadows, ivory highlights, subtle film grain.",
  duo: "Two adult dancers of diverse mixed heritage in a dynamic partner pose, monochrome fine-art photography, generous negative space, Ghanaian studio atmosphere.",
  movement: "An expressive mixed-race dancer captured mid-motion, sharp silhouette, sculptural lighting, contemporary dance magazine composition, black and white.",
};

const storyVisuals = [
  { image: ASSETS.storyOne, index: "01", alt: "Editorial movement study with two contemporary dancers" },
  { image: ASSETS.storyTwo, index: "02", alt: "Editorial movement study in a sunlit dance studio" },
  { image: ASSETS.storyThree, index: "03", alt: "Editorial detail of dancers marking rhythm" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TestimonialRail() {
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
            <div className="testimonial-card-image"><img src={story.image} alt={story.alt} /><span>Editorial visual / {story.index}</span></div>
            <div className="testimonial-card-copy"><span className="footer-label">Verified story slot {story.index}</span><h3>Real voice<br /><i>to be added.</i></h3><p>This space is reserved for an authentic dancer’s words and photograph. No invented reviews, only experiences shared with permission.</p><a href="#contact" className="line-button">Share a story <ArrowRight size={15} /></a></div>
          </article>
        ))}
      </div>
      <div className="testimonial-controls"><span>Slide left to right</span><div><button type="button" onClick={() => moveRail("previous")} aria-label="Previous testimonial story slot"><ChevronLeft size={17} /></button><button type="button" onClick={() => moveRail("next")} aria-label="Next testimonial story slot"><ChevronRight size={17} /></button></div></div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lang, setLang] = useState("EN");
  const [subject, setSubject] = useState<keyof typeof prompts>("portrait");
  const [mood, setMood] = useState("Quiet intensity");
  const [generated, setGenerated] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [posterOpen, setPosterOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) videoRef.current.pause();
      else void videoRef.current.play();
    }
    setIsVideoPlaying((playing) => !playing);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 56);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!posterOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPosterOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [posterOpen]);

  const currentPrompt = useMemo(() => `${prompts[subject]} Mood: ${mood}.`, [subject, mood]);
  const notify = (message: string) => toast(message, { style: { background: "#27313a", color: "#fff", border: "1px solid #d4af37" } });
  const generate = () => { setGenerated(true); notify("Your monochrome composition is ready."); };

  return (
    <div className="site-shell">
      <a className="whatsapp-float" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Chat with Georges West Dance on WhatsApp"><MessageCircle size={22} /><span>WhatsApp</span></a>
      <div className="language-strip"><span>GWD / STUDIO NOTES 01</span><span>New sessions open in Accra · <button onClick={() => scrollToId("booking")}>View availability →</button></span><span>English <ChevronDown size={14} /></span></div>
      <main id="top">
        <section className="hero-section" aria-label="Georges West Dance hero video">
          <video ref={videoRef} className="hero-video" poster={ASSETS.hero} autoPlay muted loop playsInline aria-label="Abstract black-and-white contemporary dance movement"><source src={ASSETS.heroVideo} type="video/mp4" /></video>
          <div className="hero-shade" />
          <header className={`site-header ${isScrolled ? "site-header--compact" : ""}`}>
            <a href="#top" className="brand" aria-label="Georges West Dance home"><img src={ASSETS.mark} alt="Georges West Dance logo" /></a>
            <nav className="desktop-nav">{navItems.map((item) => <button key={item} onClick={() => scrollToId(item.toLowerCase())}>{item}</button>)}</nav>
            <div className="header-actions"><select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Choose language"><option>EN</option><option>FR</option><option>ES</option><option>DE</option><option>ZH</option></select><BookingDialog activity="General class enquiry"><button className="gold-button header-cta" type="button">Book a class <ArrowRight size={15} /></button></BookingDialog><button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? "Close navigation" : "Open navigation"}>{mobileOpen ? <X /> : <Menu />}</button></div>
          </header>
          <div className={`mobile-nav-backdrop ${mobileOpen ? "is-open" : ""}`} aria-hidden="true" onClick={() => setMobileOpen(false)} />
          <aside id="mobile-navigation" className={`mobile-drawer ${mobileOpen ? "is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
            <div className="mobile-drawer-top"><span>GWD / NAVIGATION</span><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
            <nav>{navItems.map((item, index) => <button key={item} onClick={() => { setMobileOpen(false); scrollToId(item.toLowerCase()); }}><span>0{index + 1}</span>{item}<ArrowRight size={16} /></button>)}</nav>
            <BookingDialog activity="General class enquiry"><button className="gold-button mobile-drawer-cta" type="button" onClick={() => setMobileOpen(false)}>Book a class <ArrowRight size={15} /></button></BookingDialog>
            <p className="mobile-drawer-note">Accra · Ghana<br />A practice, not a performance.</p>
          </aside>
          <div className="hero-content"><p className="eyebrow"><span className="gold-dot" /> Contemporary dance / Accra, Ghana</p><h1>Make room<br /><i>for movement.</i></h1><p className="hero-lede">A dance studio for people who want to move with clarity. Private coaching, studio sessions and performance-led practice with Georges West.</p><div className="hero-ctas"><BookingDialog activity="General class enquiry"><button className="gold-button" type="button">Find your rhythm <ArrowRight size={17} /></button></BookingDialog><button className="text-button light-button" onClick={() => scrollToId("portfolio")}><span className="play-icon"><Play size={11} fill="currentColor" /></span> Watch the work</button></div></div>
          <div className="hero-emblem"><img src={ASSETS.mark} alt="" /><span>GWD / FILM 01</span></div>
          <div className="hero-footer"><span>01 / 01</span><span className="hero-progress"><i /></span><button className="video-control" onClick={toggleVideo} aria-label={isVideoPlaying ? "Pause hero video" : "Play hero video"}>{isVideoPlaying ? <><Pause size={13} /> Pause film</> : <><Play size={13} /> Play film</>}</button><span className="hero-location">Accra · 05°33′N 00°12′W</span></div>
        </section>

        <section className="intro-section" id="about"><div className="section-number">01</div><div className="intro-statement"><p className="eyebrow">A practice, not a performance</p><h2>Dance is how we<br /><span>take up space.</span></h2></div><div className="intro-body"><p>From the first count to the final bow in Accra, Georges West Dance develops confident, expressive movers. Each session combines disciplined technique with the freedom to build your own physical language.</p><button className="line-button" onClick={() => notify("About Georges West is coming into focus.")}>Meet Georges <ArrowRight size={15} /></button></div><div className="stat-row"><div><strong>12+</strong><span>Years in motion</span></div><div><strong>03</strong><span>Ways to learn</span></div><div><strong>01</strong><span>Shared language</span></div></div></section>

        <section className="trust-section" aria-label="Studio proof"><div className="trust-heading"><p className="eyebrow">Why people stay in motion</p><h2>Built on<br /><i>practice.</i></h2></div><div className="trust-proof-grid"><div className="trust-proof"><strong>12+</strong><span>Years in motion</span><p>A sustained practice shaped by teaching, rehearsal and performance.</p></div><div className="trust-proof"><strong>03</strong><span>Ways to learn</span><p>Private coaching, studio sessions and live online guidance for different goals.</p></div><div className="trust-notes"><span className="footer-label">Client notes</span><h3>Real voices<br />belong here.</h3><p>Share verified feedback from your dancers to complete this space. No invented reviews, only real experiences.</p><button className="line-button" onClick={() => scrollToId("voices")}>View the story slots <ArrowRight size={15} /></button></div></div></section>

        <section className="lab-section" id="classes"><div className="lab-heading"><div><p className="eyebrow">The monochrome image lab</p><h2>Put a face<br /><i>to the feeling.</i></h2></div><p>Create a visual study of the dancer you are becoming. Choose a subject, set an atmosphere and compose a black-and-white portrait rooted in movement.</p></div><div className="lab-grid"><div className="lab-controls"><div className="control-group"><label>01 / Subject</label><div className="choice-list">{([['portrait', 'Solo portrait'], ['duo', 'Dance partners'], ['movement', 'In motion']] as const).map(([value, label]) => <button className={subject === value ? "choice active" : "choice"} onClick={() => setSubject(value)} key={value}><span>{label}</span>{subject === value && <Check size={15} />}</button>)}</div></div><div className="control-group"><label>02 / Atmosphere</label><select className="wide-select" value={mood} onChange={(e) => setMood(e.target.value)}><option>Quiet intensity</option><option>Sunlit confidence</option><option>After-hours energy</option><option>Soft focus</option></select></div><button className="generate-button" onClick={generate}><Sparkles size={17} /> Generate image <ArrowRight size={17} /></button><p className="tiny-note">A creative concept preview · No account required</p></div><div className="result-frame">{generated ? <><img src={subject === "portrait" ? ASSETS.studio : subject === "duo" ? ASSETS.hero : ASSETS.performance} alt="Generated monochrome dance composition" /><div className="result-overlay"><span>GWD / IMAGE LAB</span><strong>COMPOSITION<br />READY</strong><button onClick={() => navigator.clipboard?.writeText(currentPrompt).then(() => notify("Prompt copied to clipboard."))}>Copy prompt →</button></div></> : <div className="empty-result"><div className="empty-symbol">✳</div><p>Select a subject.<br />We’ll start from there.</p><span>YOUR RESULT WILL APPEAR HERE</span></div>}<div className="frame-corner tl" /><div className="frame-corner br" /></div></div></section>

        <section className="program-section"><div className="section-topline"><p className="eyebrow">Choose your entry point</p><button className="line-button" onClick={() => notify("All class formats are available by enquiry.")}>View all classes <ArrowRight size={15} /></button></div><div className="program-list"><a className="program-row" href="/classes/private"><span className="program-no">01</span><div><h3>Private / at home</h3><p>One-to-one coaching, tailored to your goals, pace and space.</p></div><ArrowDownRight /></a><a className="program-row" href="/classes/studio"><span className="program-no">02</span><div><h3>Studio / together</h3><p>Structured studio classes where technique, musicality and connection grow together.</p></div><ArrowDownRight /></a><a className="program-row" href="/classes/online"><span className="program-no">03</span><div><h3>Online / anywhere</h3><p>Live masterclasses that bring focused studio guidance to wherever you are.</p></div><ArrowDownRight /></a></div></section>

        <section className="portfolio-section" id="portfolio"><div className="portfolio-image"><img src={ASSETS.performance} alt="Dancers performing in dramatic black and white stage light" /><a className="round-play" href="https://www.youtube.com/results?search_query=Georges+West+Dance" target="_blank" rel="noreferrer" aria-label="Open Georges West Dance on YouTube"><Play size={19} fill="currentColor" /></a><span className="image-tag">Performance archive / 02</span></div><div className="portfolio-copy"><p className="eyebrow">02 / The archive</p><h2>See the work<br /><i>in the wild.</i></h2><p>Stage performances, competition work and private events — a living record of how practice becomes performance.</p><button className="gold-button" onClick={() => notify("The full portfolio is being curated.")}>Explore portfolio <ArrowRight size={17} /></button><a className="youtube-link" href="https://www.youtube.com/results?search_query=Georges+West+Dance" target="_blank" rel="noreferrer"><Youtube size={15} /> Watch on YouTube <ArrowRight size={14} /></a><div className="portfolio-counter"><strong>03</strong><span>chapters<br />in the archive</span></div></div></section>

        <section className="booking-section" id="booking"><div className="booking-mark"><img src={ASSETS.mark} alt="" /><span>↘</span></div><div><p className="eyebrow">03 / Your next count</p><h2>Ready when<br /><i>you are.</i></h2></div><div className="booking-copy"><p>From Osu to East Legon and beyond, tell us what you want to learn, where you want to move and when you are ready to begin. We’ll recommend the right first step.</p><BookingDialog activity="General class enquiry"><button className="dark-button" type="button">Start a booking <CalendarDays size={16} /></button></BookingDialog><span>+233 54 403 6021</span></div></section>

        <section className="contact-section" id="contact"><div><p className="eyebrow">Stay in the rhythm</p><h2>Notes from<br /><i>the studio.</i></h2></div><form onSubmit={(e) => { e.preventDefault(); notify("You’re on the list."); }}><label htmlFor="email">Receive occasional studio news, new session dates and work in progress.</label><div className="email-row"><input id="email" type="email" placeholder="Your email address" required /><button aria-label="Subscribe"><ArrowRight /></button></div></form></section>

        <section className="testimonials-section" id="voices"><div className="testimonials-heading"><div><p className="eyebrow">04 / Stories in motion</p><h2>Real voices<br /><i>belong here.</i></h2></div><p>Scroll through the editorial story slots below. Once dancers share their verified words and photos with permission, each slot can become a true testimony.</p></div><TestimonialRail /></section>

        <section className="events-section" id="events" aria-labelledby="events-title"><div className="events-heading"><p className="eyebrow">05 / Upcoming events</p><h2 id="events-title">Meet us<br /><i>in the room.</i></h2><p>Keep your practice social. Discover the next dance nights, open classes and community moments around Accra.</p></div><article className="event-feature"><div className="event-poster"><button type="button" className="event-poster-trigger" onClick={() => setPosterOpen(true)} aria-label="View the Bachata and Salsa Night poster full size"><img src={ASSETS.eventPoster} alt="Bachata and Salsa Night poster at Afrikiko" /><span className="image-tag">View poster / 01</span></button></div><div className="event-details"><div className="event-kicker"><span className="event-status">Next up</span><span>Every Sunday</span></div><h3>Bachata &amp; Salsa<br /><i>Night.</i></h3><p className="event-intro">A free Bachata class to start the evening, followed by social dancing, good music and a welcoming room at Afrikiko.</p><dl className="event-facts"><div><dt>Class</dt><dd>7:00 PM — 8:00 PM<br /><span>Free Bachata class</span></dd></div><div><dt>Social</dt><dd>8:00 PM — late<br /><span>With Mavé</span></dd></div><div><dt>Where</dt><dd>Afrikiko<br /><span>Eat · Drink · Dance · Vibe</span></dd></div><div><dt>Format</dt><dd>Open class + social night<br /><span>Community dance event</span></dd></div><div><dt>Contact</dt><dd>Georges West Dance<br /><span>+233 54 403 6021</span></dd></div></dl><div className="event-actions"><a className="gold-button" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Ask about this event <MessageCircle size={16} /></a><a className="line-button" href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp the studio <ArrowRight size={15} /></a></div><p className="event-note">Starting this Sunday · Accra, Ghana · Details may change, so message the studio before travelling.</p></div></article><div className={`event-lightbox ${posterOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Bachata and Salsa Night poster" aria-hidden={!posterOpen} onClick={() => setPosterOpen(false)}><div className="event-lightbox-inner" onClick={(event) => event.stopPropagation()}><button type="button" className="event-lightbox-close" onClick={() => setPosterOpen(false)} aria-label="Close event poster"><X size={20} /></button><img src={ASSETS.eventPoster} alt="Bachata and Salsa Night poster at Afrikiko, full size" /></div></div></section>
      </main>
      <footer><div className="footer-top"><div className="footer-brand"><img src={ASSETS.mark} alt="Georges West Dance logo" /><p>Contemporary dance / Accra, Ghana.</p></div><div className="footer-links footer-links--compact"><div><span className="footer-label">Explore</span><button onClick={() => scrollToId("classes")}>Classes</button><button onClick={() => scrollToId("portfolio")}>Portfolio</button><button onClick={() => scrollToId("booking")}>Booking</button></div><div><span className="footer-label">Connect</span><a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a><a href="https://www.youtube.com/results?search_query=Georges+West+Dance" target="_blank" rel="noreferrer"><Youtube size={14} /> YouTube</a><a href="#contact"><Instagram size={14} /> Instagram</a></div></div></div><div className="footer-bottom"><span>© 2024 Georges West Dance</span><span>Accra · Ghana</span><span>EN · FR · ES · DE · ZH</span></div></footer>
    </div>
  );
}
