// Style direction: Galerie Brutaliste Dorée refondue — hero cinématique plein écran, typographie d’affiche, ivoire/charbon, or ghanéen en gestes précis.
import { useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowRight, CalendarDays, Check, ChevronDown, Instagram, Menu, Pause, Play, Sparkles, X, Youtube } from "lucide-react";
import { toast } from "sonner";

const ASSETS = {
  mark: "/manus-storage/gwd-mark_6cf77a9a.png",
  hero: "/manus-storage/gwd-hero-dancers_2b7c01fa.jpg",
  studio: "/manus-storage/gwd-studio-portrait_de5862bb.jpg",
  performance: "/manus-storage/gwd-performance_b1dcb140.jpg",
  heroVideo: "/manus-storage/gwd-hero-video_2d7b6989.mp4",
};

const navItems = ["Classes", "Portfolio", "Booking", "About", "Contact"];
const prompts = {
  portrait: "A striking black-and-white editorial portrait of a mixed-heritage dancer, natural light, deep charcoal shadows, ivory highlights, subtle film grain.",
  duo: "Two adult dancers of diverse mixed heritage in a dynamic partner pose, monochrome fine-art photography, generous negative space, Ghanaian studio atmosphere.",
  movement: "An expressive mixed-race dancer captured mid-motion, sharp silhouette, sculptural lighting, contemporary dance magazine composition, black and white.",
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState("EN");
  const [subject, setSubject] = useState<keyof typeof prompts>("portrait");
  const [mood, setMood] = useState("Quiet intensity");
  const [generated, setGenerated] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) videoRef.current.pause();
      else void videoRef.current.play();
    }
    setIsVideoPlaying((playing) => !playing);
  };
  const currentPrompt = useMemo(() => `${prompts[subject]} Mood: ${mood}.`, [subject, mood]);
  const notify = (message: string) => toast(message, { style: { background: "#27313a", color: "#fff", border: "1px solid #d4af37" } });
  const generate = () => { setGenerated(true); notify("Your monochrome composition is ready."); };

  return (
    <div className="site-shell">
      <div className="language-strip"><span>GWD / STUDIO NOTES 01</span><span>New sessions open in Accra · <button onClick={() => scrollToId("booking")}>View availability →</button></span><span>English <ChevronDown size={14} /></span></div>
      <main id="top">
        <section className="hero-section" aria-label="Georges West Dance hero video">
          <video ref={videoRef} className="hero-video" poster={ASSETS.hero} autoPlay muted loop playsInline aria-label="Abstract black-and-white contemporary dance movement"><source src={ASSETS.heroVideo} type="video/mp4" /></video>
          <div className="hero-shade" />
          <header className="site-header">
            <a href="#top" className="brand" aria-label="Georges West Dance home"><img src={ASSETS.mark} alt="" /><span>GEORGES WEST<br /><em>DANCE</em></span></a>
            <nav className={mobileOpen ? "nav-open" : ""}>{navItems.map((item) => <button key={item} onClick={() => { setMobileOpen(false); scrollToId(item.toLowerCase()); }}>{item}</button>)}</nav>
            <div className="header-actions"><select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Choose language"><option>EN</option><option>FR</option><option>ES</option><option>DE</option><option>ZH</option></select><button className="gold-button header-cta" onClick={() => scrollToId("booking")}>Book a class <ArrowRight size={15} /></button><button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</button></div>
          </header>
          <div className="hero-content"><p className="eyebrow"><span className="gold-dot" /> Contemporary dance / Accra, Ghana</p><h1>Make room<br /><i>for movement.</i></h1><p className="hero-lede">A dance studio for bodies that want to speak clearly. Private coaching, studio sessions and performance-led practice with Georges West.</p><div className="hero-ctas"><button className="gold-button" onClick={() => scrollToId("booking")}>Find your rhythm <ArrowRight size={17} /></button><button className="text-button light-button" onClick={() => scrollToId("portfolio")}><span className="play-icon"><Play size={11} fill="currentColor" /></span> Watch the work</button></div></div>
          <div className="hero-emblem"><img src={ASSETS.mark} alt="" /><span>GWD / FILM 01</span></div>
          <div className="hero-footer"><span>01 / 01</span><span className="hero-progress"><i /></span><button className="video-control" onClick={toggleVideo} aria-label={isVideoPlaying ? "Pause hero video" : "Play hero video"}>{isVideoPlaying ? <><Pause size={13} /> Pause film</> : <><Play size={13} /> Play film</>}</button><span className="hero-location">Accra · 05°33′N 00°12′W</span></div>
        </section>

        <section className="intro-section" id="about"><div className="section-number">01</div><div className="intro-statement"><p className="eyebrow">A practice, not a performance</p><h2>Dance is how we<br /><span>take up space.</span></h2></div><div className="intro-body"><p>From the first count to the final bow in Accra, Georges West Dance builds confidence through movement. Our approach pairs disciplined technique with the freedom to find your own language.</p><button className="line-button" onClick={() => notify("About Georges West is coming into focus.")}>Meet Georges <ArrowRight size={15} /></button></div><div className="stat-row"><div><strong>12+</strong><span>Years in motion</span></div><div><strong>03</strong><span>Ways to learn</span></div><div><strong>01</strong><span>Shared language</span></div></div></section>

        <section className="lab-section" id="classes"><div className="lab-heading"><div><p className="eyebrow">The monochrome image lab</p><h2>Put a face<br /><i>to the feeling.</i></h2></div><p>Make a visual study of the person you are becoming. Shape a prompt, choose a mood, and compose a black-and-white portrait rooted in movement.</p></div><div className="lab-grid"><div className="lab-controls"><div className="control-group"><label>01 / Subject</label><div className="choice-list">{([['portrait', 'Solo portrait'], ['duo', 'Dance partners'], ['movement', 'In motion']] as const).map(([value, label]) => <button className={subject === value ? "choice active" : "choice"} onClick={() => setSubject(value)} key={value}><span>{label}</span>{subject === value && <Check size={15} />}</button>)}</div></div><div className="control-group"><label>02 / Atmosphere</label><select className="wide-select" value={mood} onChange={(e) => setMood(e.target.value)}><option>Quiet intensity</option><option>Sunlit confidence</option><option>After-hours energy</option><option>Soft focus</option></select></div><button className="generate-button" onClick={generate}><Sparkles size={17} /> Generate image <ArrowRight size={17} /></button><p className="tiny-note">A creative concept preview · No account required</p></div><div className="result-frame">{generated ? <><img src={subject === "portrait" ? ASSETS.studio : subject === "duo" ? ASSETS.hero : ASSETS.performance} alt="Generated monochrome dance composition" /><div className="result-overlay"><span>GWD / IMAGE LAB</span><strong>COMPOSITION<br />READY</strong><button onClick={() => navigator.clipboard?.writeText(currentPrompt).then(() => notify("Prompt copied to clipboard."))}>Copy prompt →</button></div></> : <div className="empty-result"><div className="empty-symbol">✳</div><p>Select a subject.<br />We’ll start from there.</p><span>YOUR RESULT WILL APPEAR HERE</span></div>}<div className="frame-corner tl" /><div className="frame-corner br" /></div></div></section>

        <section className="program-section"><div className="section-topline"><p className="eyebrow">Choose your entry point</p><button className="line-button" onClick={() => notify("All class formats are available by enquiry.")}>View all classes <ArrowRight size={15} /></button></div><div className="program-list"><article><span className="program-no">01</span><div><h3>Private / at home</h3><p>One-on-one coaching, tailored to your pace and your space.</p></div><ArrowDownRight /></article><article><span className="program-no">02</span><div><h3>Studio / together</h3><p>Structured classes with room to experiment, connect and grow.</p></div><ArrowDownRight /></article><article><span className="program-no">03</span><div><h3>Online / anywhere</h3><p>Live masterclasses that bring the studio into your living room.</p></div><ArrowDownRight /></article></div></section>

        <section className="portfolio-section" id="portfolio"><div className="portfolio-image"><img src={ASSETS.performance} alt="Dancers performing in dramatic black and white stage light" /><button className="round-play" onClick={() => notify("Portfolio video player coming soon.")}><Play size={19} fill="currentColor" /></button><span className="image-tag">Performance archive / 02</span></div><div className="portfolio-copy"><p className="eyebrow">02 / The archive</p><h2>See the work<br /><i>in the wild.</i></h2><p>Stage performances, competition cuts and private event work — a moving record of where practice takes us.</p><button className="gold-button" onClick={() => notify("The full portfolio is being curated.")}>Explore portfolio <ArrowRight size={17} /></button><div className="portfolio-counter"><strong>03</strong><span>chapters<br />in the archive</span></div></div></section>

        <section className="booking-section" id="booking"><div className="booking-mark"><img src={ASSETS.mark} alt="" /><span>↘</span></div><div><p className="eyebrow">03 / Your next count</p><h2>Ready when<br /><i>you are.</i></h2></div><div className="booking-copy"><p>From Osu to East Legon and everywhere your rhythm takes you, tell us what you want to learn and when you want to move. We’ll find the right first step.</p><button className="dark-button" onClick={() => notify("Booking enquiry noted — we’ll be in touch.")}>Start a booking <CalendarDays size={16} /></button><span>+233 54 403 6021</span></div></section>

        <section className="contact-section" id="contact"><div><p className="eyebrow">Stay in the rhythm</p><h2>Notes from<br /><i>the studio.</i></h2></div><form onSubmit={(e) => { e.preventDefault(); notify("You’re on the list."); }}><label htmlFor="email">Occasional news, new sessions, and work in progress.</label><div className="email-row"><input id="email" type="email" placeholder="Your email address" required /><button aria-label="Subscribe"><ArrowRight /></button></div></form></section>
      </main>
      <footer><div className="footer-brand"><img src={ASSETS.mark} alt="" /><span>GEORGES WEST<br /><em>DANCE</em></span></div><div className="footer-links"><div><span className="footer-label">Explore</span><button onClick={() => scrollToId("classes")}>Classes</button><button onClick={() => scrollToId("portfolio")}>Portfolio</button><button onClick={() => scrollToId("booking")}>Booking</button></div><div><span className="footer-label">Follow</span><a href="#contact"><Instagram size={15} /> Instagram</a><a href="#contact"><Youtube size={15} /> YouTube</a></div><div><span className="footer-label">Based in</span><span>Accra, Ghana<br />+233 54 403 6021</span></div></div><div className="footer-bottom"><span>© 2024 Georges West Dance</span><span>Made for movement.</span><span>EN · FR · ES · DE · ZH</span></div></footer>
    </div>
  );
}
