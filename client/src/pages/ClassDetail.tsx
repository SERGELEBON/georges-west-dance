// Style direction: Galerie Brutaliste Dorée — pages de cours éditoriales, claires, structurées par le mouvement et la preuve de pratique.
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, MonitorPlay } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const ASSETS = {
  mark: "/manus-storage/gwd-official-logo_20959e49.jpg",
  studio: "/manus-storage/gwd-studio-portrait_de5862bb.jpg",
  performance: "/manus-storage/gwd-performance_b1dcb140.jpg",
};

const courseData = {
  private: {
    index: "01", eyebrow: "Private / at home", title: "Build confidence\nin your own space.", intro: "One-on-one dance coaching designed around your body, your schedule and the room where you want to move.", image: ASSETS.studio, format: "Private coaching", place: "Your home · Accra", duration: "60 or 90 minutes", detail: "Whether you are preparing for a first dance, returning to movement or looking for focused technical progress, each session is built around a clear intention. Georges West brings structure, patience and professional feedback directly to you.", outcomes: ["A tailored session plan after your first conversation", "Technique, musicality and confidence developed at your pace", "Practical guidance you can repeat between sessions"]
  },
  studio: {
    index: "02", eyebrow: "Studio / together", title: "Learn the language.\nFind your people.", intro: "Structured studio sessions where technique meets connection, rhythm and the confidence to be seen.", image: ASSETS.performance, format: "Small-group or private", place: "Partner studio · Accra", duration: "60 or 90 minutes", detail: "The studio is where individual practice becomes shared energy. Sessions are progressive, welcoming and specific: we work from foundations into musicality, partner connection and expressive performance.", outcomes: ["A clear progression from fundamentals to performance", "A supportive studio rhythm with focused instruction", "Exercises that connect technique to real music"]
  },
  online: {
    index: "03", eyebrow: "Online / anywhere", title: "Keep moving.\nWherever you are.", intro: "Live masterclasses and personal coaching for dancers who want expert guidance without leaving their routine.", image: ASSETS.studio, format: "Live video session", place: "Online · worldwide", duration: "60 minutes", detail: "Distance should not interrupt practice. Online sessions are built for clarity: camera-friendly combinations, direct corrections and a focused structure that helps you keep momentum between classes.", outcomes: ["Live feedback through a simple video setup", "A session adapted to your experience and available space", "A repeatable practice plan for the days between calls"]
  }
} as const;

type CourseKey = keyof typeof courseData;

export default function ClassDetail() {
  const [location] = useLocation();
  const key = (location.split("/").pop() || "private") as CourseKey;
  const course = courseData[key] || courseData.private;
  const notify = () => toast("Booking enquiry noted — we’ll be in touch.", { style: { background: "#27313a", color: "#fff", border: "1px solid #d4af37" } });

  return <div className="detail-page">
    <header className="detail-header"><Link href="/" className="detail-brand"><img src={ASSETS.mark} alt="Georges West Dance logo" /></Link><Link href="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link><button className="gold-button" onClick={notify}>Book a class <ArrowRight size={15} /></button></header>
    <main>
      <section className="detail-hero"><div className="detail-hero-copy"><p className="eyebrow"><span className="gold-dot" /> {course.eyebrow} / Georges West Dance</p><h1>{course.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h1><p>{course.intro}</p><button className="gold-button" onClick={notify}>Start your enquiry <ArrowRight size={17} /></button></div><div className="detail-hero-image"><img src={course.image} alt="Dance session at Georges West Dance" /><span>{course.index} / 03</span></div></section>
      <section className="detail-overview"><div className="section-number">{course.index}</div><div><p className="eyebrow">What this looks like</p><h2>A session with<br /><i>intention.</i></h2></div><div className="detail-overview-copy"><p>{course.detail}</p><div className="detail-specs"><div><Clock3 size={17} /><span>{course.duration}</span></div><div>{key === "online" ? <MonitorPlay size={17} /> : <MapPin size={17} />}<span>{course.place}</span></div><div><CalendarDays size={17} /><span>By appointment</span></div></div></div></section>
      <section className="detail-outcomes"><div><p className="eyebrow">What you leave with</p><h2>Progress you<br /><i>can feel.</i></h2></div><div className="outcome-list">{course.outcomes.map((outcome, index) => <div key={outcome}><span>0{index + 1}</span><p><Check size={15} />{outcome}</p></div>)}</div></section>
      <section className="detail-cta"><div><p className="eyebrow">Your next count</p><h2>Make the<br /><i>first move.</i></h2></div><div><p>Tell us what you want to learn and we will recommend the right format, rhythm and next step for you.</p><button className="dark-button" onClick={notify}>Book this format <ArrowRight size={16} /></button></div></section>
    </main>
    <footer className="detail-footer"><img src={ASSETS.mark} alt="Georges West Dance logo" /><span>© 2024 Georges West Dance · Accra, Ghana</span><Link href="/">Return to the studio →</Link></footer>
  </div>;
}
