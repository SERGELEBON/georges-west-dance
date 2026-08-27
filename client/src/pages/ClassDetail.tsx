// Style direction: Galerie Brutaliste Dorée — pages éditoriales, visuels documentaires, réservation serveur et horaires lisibles.
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, MapPin, MonitorPlay, Send } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

const ASSETS = {
  mark: "/manus-storage/gwd-official-logo_20959e49.jpg",
  private: "/manus-storage/gwd-private-session_7005ecd4.jpg",
  studio: "/manus-storage/gwd-studio-session_5f59928c.jpg",
  online: "/manus-storage/gwd-online-session_9ae8bc50.jpg",
};

const courseData = {
  private: { index: "01", eyebrow: "Private / at home", title: "Build confidence\nin your own space.", intro: "One-on-one dance coaching designed around your body, your schedule and the room where you want to move.", image: ASSETS.private, format: "Private coaching", place: "Your home · Accra", duration: "60 or 90 minutes", detail: "Whether you are preparing for a first dance, returning to movement or looking for focused technical progress, each session is built around a clear intention. Georges West brings structure, patience and professional feedback directly to you.", outcomes: ["A tailored session plan after your first conversation", "Technique, musicality and confidence developed at your pace", "Practical guidance you can repeat between sessions"] },
  studio: { index: "02", eyebrow: "Studio / together", title: "Learn the language.\nFind your people.", intro: "Structured studio sessions where technique meets connection, rhythm and the confidence to be seen.", image: ASSETS.studio, format: "Small-group or private", place: "Partner studio · Accra", duration: "60 or 90 minutes", detail: "The studio is where individual practice becomes shared energy. Sessions are progressive, welcoming and specific: we work from foundations into musicality, partner connection and expressive performance.", outcomes: ["A clear progression from fundamentals to performance", "A supportive studio rhythm with focused instruction", "Exercises that connect technique to real music"] },
  online: { index: "03", eyebrow: "Online / anywhere", title: "Keep moving.\nWherever you are.", intro: "Live masterclasses and personal coaching for dancers who want expert guidance without leaving their routine.", image: ASSETS.online, format: "Live video session", place: "Online · worldwide", duration: "60 minutes", detail: "Distance should not interrupt practice. Online sessions are built for clarity: camera-friendly combinations, direct corrections and a focused structure that helps you keep momentum between classes.", outcomes: ["Live feedback through a simple video setup", "A session adapted to your experience and available space", "A repeatable practice plan for the days between calls"] },
} as const;

type CourseKey = keyof typeof courseData;
const studioSlots = ["09:00", "11:00", "14:00", "17:30"];

export default function ClassDetail() {
  const [location] = useLocation();
  const key = (location.split("/").pop() || "private") as CourseKey;
  const course = courseData[key] || courseData.private;
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [selectedSlot, setSelectedSlot] = useState("");
  const [calendarOffset, setCalendarOffset] = useState(0);
  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });
  const calendarDays = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index + 1 + calendarOffset * 7);
    return date;
  }), [calendarOffset]);
  const goToForm = () => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const formatSlot = (date: Date, time: string) => `${date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${time}`;
  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitContact.mutate({ name: form.name, email: form.email, phone: form.phone || undefined, activity: course.format, slot: selectedSlot || undefined, message: form.message });
  };

  return <div className="detail-page">
    <header className="detail-header"><Link href="/" className="detail-brand"><img src={ASSETS.mark} alt="Georges West Dance logo" /></Link><Link href="/" className="back-link"><ArrowLeft size={15} /> Back to home</Link><button className="gold-button" onClick={goToForm}>Book a class <ArrowRight size={15} /></button></header>
    <main>
      <section className="detail-hero"><div className="detail-hero-copy"><p className="eyebrow"><span className="gold-dot" /> {course.eyebrow} / Georges West Dance</p><h1>{course.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h1><p>{course.intro}</p><button className="gold-button" onClick={goToForm}>Start your enquiry <ArrowRight size={17} /></button></div><div className="detail-hero-image"><img src={course.image} alt={`${course.format} at Georges West Dance`} /><span>{course.index} / 03</span></div></section>
      <section className="detail-overview"><div className="section-number">{course.index}</div><div><p className="eyebrow">What this looks like</p><h2>A session with<br /><i>intention.</i></h2></div><div className="detail-overview-copy"><p>{course.detail}</p><div className="detail-specs"><div><Clock3 size={17} /><span>{course.duration}</span></div><div>{key === "online" ? <MonitorPlay size={17} /> : <MapPin size={17} />}<span>{course.place}</span></div><div><CalendarDays size={17} /><span>By appointment</span></div></div></div></section>
      {key === "studio" && <section className="availability-section"><div><p className="eyebrow">Studio availability</p><h2>Choose a<br /><i>rhythm.</i></h2><p className="availability-intro">Select an indicative studio slot and include it in your enquiry. Georges West will confirm the final availability with you.</p></div><div className="calendar-shell"><div className="calendar-head"><button onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 1))} aria-label="Previous week"><ChevronLeft size={17} /></button><strong>{calendarDays[0]?.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</strong><button onClick={() => setCalendarOffset(calendarOffset + 1)} aria-label="Next week"><ChevronRight size={17} /></button></div><div className="calendar-grid">{calendarDays.map((date) => <div className="calendar-day" key={date.toISOString()}><span>{date.toLocaleDateString("en-GB", { weekday: "short" })}</span><strong>{date.getDate()}</strong>{studioSlots.map((time) => { const slot = formatSlot(date, time); return <button key={slot} className={selectedSlot === slot ? "slot active" : "slot"} onClick={() => setSelectedSlot(slot)}>{time}</button>; })}</div>)}</div>{selectedSlot && <div className="selected-slot">Selected: <strong>{selectedSlot}</strong></div>}</div></section>}
      <section className="detail-outcomes"><div><p className="eyebrow">What you leave with</p><h2>Progress you<br /><i>can feel.</i></h2></div><div className="outcome-list">{course.outcomes.map((outcome, index) => <div key={outcome}><span>0{index + 1}</span><p><Check size={15} />{outcome}</p></div>)}</div></section>
      <section className="detail-cta"><div><p className="eyebrow">Your next count</p><h2>Make the<br /><i>first move.</i></h2></div><div><p>Tell us what you want to learn and we will recommend the right format, rhythm and next step for you.</p><button className="dark-button" onClick={goToForm}>Book this format <ArrowRight size={16} /></button></div></section>
      <section className="contact-form-section" id="contact-form"><div><p className="eyebrow">04 / Enquiry desk</p><h2>Tell us where<br /><i>to begin.</i></h2><p className="contact-form-intro">Share a few details and Georges West will come back with the right next step for your movement practice.</p><div className="contact-route"><span>Selected activity</span><strong>{course.format}</strong>{selectedSlot && <small>{selectedSlot}</small>}</div></div><form onSubmit={submitForm}><div className="form-grid"><label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label><label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label></div><label>Phone / WhatsApp<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233 ..." /></label><label>Tell us about your goal<textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What would you like to work on?" /></label><button className="dark-button" type="submit" disabled={submitContact.isPending}><Send size={15} /> {submitted ? "Enquiry sent" : submitContact.isPending ? "Sending..." : "Send enquiry"} <ArrowRight size={15} /></button>{submitContact.isError && <p className="form-error">We could not send your enquiry. Please try again or contact the studio directly.</p>}<p className="form-note">Your enquiry is sent securely to the Georges West Dance team.</p></form></section>
    </main>
    <footer className="detail-footer"><img src={ASSETS.mark} alt="Georges West Dance logo" /><span>© 2024 Georges West Dance · Accra, Ghana</span><Link href="/">Return to the studio →</Link></footer>
  </div>;
}
