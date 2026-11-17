import { z } from "zod";

/**
 * Single source of truth for every editable piece of the public website.
 * The admin panel edits this document; the server validates it with the same
 * schema before storing it, so nothing unexpected can reach the pages.
 */

const MANUS = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663032235701";

// Only same-site paths ("/media/x.mp4") or https URLs are accepted. This blocks
// javascript:, data: and other schemes that could be abused in href/src.
const SAFE_URL = /^(\/(?!\/)[\w\-./%~]*|https:\/\/[\w\-.]+(:\d+)?(\/[\w\-./%~+@:=&?#,;!]*)?)$/;

export const urlField = (max = 600) =>
  z.string().trim().max(max).refine(v => v === "" || SAFE_URL.test(v), {
    message: "Must be an https:// URL or a path starting with /",
  });

const text = (max: number) => z.string().trim().max(max);
const line = (max = 160) => text(max).refine(v => !/[<>]/.test(v), { message: "< and > are not allowed" });

export const heroSlideSchema = z.object({
  id: text(40).min(1),
  type: z.enum(["video", "image"]),
  /** Main file (desktop / landscape). */
  src: urlField().refine(v => v.length > 0, { message: "A file is required" }),
  /** Optional file for phones (portrait). Falls back to `src`. */
  mobileSrc: urlField(),
  poster: urlField(),
  alt: line(200),
  /** cover = fill the screen; blur = keep the whole frame visible over a blurred copy (for vertical videos). */
  fit: z.enum(["cover", "blur"]),
  grayscale: z.boolean(),
  /** Duration for image slides, in seconds. Videos advance when they end. */
  duration: z.number().int().min(3).max(60),
});

const statSchema = z.object({ value: line(12), label: line(60) });

const eventFactSchema = z.object({ label: line(40), value: line(80), sub: line(80) });

export const eventSchema = z.object({
  id: text(40).min(1),
  published: z.boolean(),
  status: line(40),
  schedule: line(60),
  titleLine1: line(60),
  titleLine2: line(60),
  intro: text(600),
  poster: urlField(),
  posterAlt: line(200),
  facts: z.array(eventFactSchema).max(8),
  note: text(300),
  ctaUrl: urlField(),
});

const courseSchema = z.object({
  eyebrow: line(60),
  title: text(120),
  intro: text(400),
  image: urlField(),
  format: line(60),
  place: line(60),
  duration: line(60),
  detail: text(1200),
  outcomes: z.array(line(200)).max(6),
});

const programRowSchema = z.object({ title: line(60), description: text(240), href: urlField() });

const experienceSchema = z.object({ role: line(100), org: line(100), period: line(60), description: text(800) });

export const siteContentSchema = z.object({
  version: z.literal(1),
  sections: z.object({
    george: z.boolean(),
    trust: z.boolean(),
    events: z.boolean(),
    lab: z.boolean(),
    programs: z.boolean(),
    portfolio: z.boolean(),
    booking: z.boolean(),
    newsletter: z.boolean(),
    testimonials: z.boolean(),
  }),
  brand: z.object({
    logo: urlField(),
    announcement: line(120),
    footerTagline: line(120),
  }),
  contact: z.object({
    phone: line(40),
    whatsappNumber: z.string().trim().regex(/^\d{8,15}$/, "Digits only, with country code (e.g. 233544036021)"),
    whatsappMessage: line(200),
    email: z.union([z.literal(""), z.string().trim().email().max(200)]),
    youtubeUrl: urlField(),
    instagramUrl: urlField(),
    linkedinUrl: urlField(),
    location: line(80),
  }),
  hero: z.object({
    eyebrow: line(80),
    titleLine1: line(40),
    titleLine2: line(40),
    lede: text(320),
    primaryCta: line(40),
    secondaryCta: line(40),
    slides: z.array(heroSlideSchema).min(1).max(8),
  }),
  about: z.object({
    eyebrow: line(80),
    titleLine1: line(60),
    titleLine2: line(60),
    body: text(800),
    stats: z.array(statSchema).max(4),
  }),
  george: z.object({
    eyebrow: line(80),
    name: line(80),
    headline: line(160),
    photo: urlField(),
    photoAlt: line(200),
    bio: text(1500),
    languagesTitle: line(60),
    languages: z.array(line(40)).max(12),
    experienceTitle: line(60),
    experience: z.array(experienceSchema).max(8),
    skills: z.array(line(60)).max(16),
  }),
  trust: z.object({
    eyebrow: line(80),
    titleLine1: line(60),
    titleLine2: line(60),
    proofs: z.array(z.object({ value: line(12), label: line(60), text: text(300) })).max(3),
  }),
  events: z.object({
    eyebrow: line(80),
    titleLine1: line(60),
    titleLine2: line(60),
    intro: text(400),
    autoplaySeconds: z.number().int().min(0).max(30).default(7),
    items: z.array(eventSchema).max(12),
  }),
  programs: z.object({
    eyebrow: line(80),
    rows: z.array(programRowSchema).max(6),
  }),
  courses: z.object({ private: courseSchema, studio: courseSchema, online: courseSchema }),
  portfolio: z.object({
    eyebrow: line(80),
    titleLine1: line(60),
    titleLine2: line(60),
    text: text(500),
    image: urlField(),
    imageAlt: line(200),
    chapters: line(12),
  }),
  booking: z.object({
    eyebrow: line(80),
    titleLine1: line(60),
    titleLine2: line(60),
    text: text(500),
  }),
  seo: z.object({
    title: line(70),
    description: line(170),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type SiteEvent = z.infer<typeof eventSchema>;
export type CourseKey = keyof SiteContent["courses"];

export function whatsappUrl(content: Pick<SiteContent, "contact">) {
  return `https://wa.me/${content.contact.whatsappNumber}?text=${encodeURIComponent(content.contact.whatsappMessage)}`;
}

export const DEFAULT_CONTENT: SiteContent = {
  version: 1,
  sections: { george: true, trust: true, events: true, lab: true, programs: true, portfolio: true, booking: true, newsletter: true, testimonials: true },
  brand: {
    logo: `${MANUS}/dKCZczrKpxxCKHmx.jpg`,
    announcement: "New sessions open in Accra",
    footerTagline: "Afro-Latin & partner dance / Accra, Ghana.",
  },
  contact: {
    phone: "+233 54 403 6021",
    whatsappNumber: "233544036021",
    whatsappMessage: "Hello Georges West Dance, I'd like to ask about a class.",
    email: "",
    youtubeUrl: "https://www.youtube.com/results?search_query=Georges+West+Dance",
    instagramUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/george-adade",
    location: "Accra · Ghana",
  },
  hero: {
    eyebrow: "Contemporary dance / Accra, Ghana",
    titleLine1: "Make room",
    titleLine2: "for movement.",
    lede: "A dance studio for people who want to move with clarity. Private coaching, studio sessions and performance-led practice with Georges West.",
    primaryCta: "Find your rhythm",
    secondaryCta: "Watch the work",
    slides: [
      {
        id: "george-social",
        type: "video",
        src: "/media/hero-george-wide.mp4",
        mobileSrc: "/media/hero-george-portrait.mp4",
        poster: "/media/hero-george-wide-poster.jpg",
        alt: "George dancing salsa with a partner at a social dance night in Accra",
        fit: "cover",
        grayscale: false,
        duration: 8,
      },
      {
        id: "studio-film",
        type: "video",
        src: `${MANUS}/KiffohzpQOodozcD.mp4`,
        mobileSrc: "",
        poster: `${MANUS}/NQtYZFgGgHYRjyXB.jpg`,
        alt: "Contemporary dance movement filmed in the studio",
        fit: "cover",
        grayscale: true,
        duration: 8,
      },
    ],
  },
  about: {
    eyebrow: "A practice, not a performance",
    titleLine1: "Dance is how we",
    titleLine2: "take up space.",
    body: "From the first count to the final bow in Accra, Georges West Dance develops confident, expressive movers. Each session combines disciplined technique with the freedom to build your own physical language.",
    stats: [
      { value: "12+", label: "Years in motion" },
      { value: "03", label: "Ways to learn" },
      { value: "06", label: "Languages spoken" },
    ],
  },
  george: {
    eyebrow: "Meet your instructor",
    name: "George Adade",
    headline: "Dance instructor · Multilingual communicator · Accra, Ghana",
    photo: "/media/george-portrait.jpg",
    photoAlt: "George Adade dancing at a social dance night",
    bio: "George leads Georges West Dance with the same thing that drives his work as a translator and interpreter: helping people connect. Whether you are taking your first steps or polishing your partner work, he explains every move clearly, adapts to your pace and makes sure language is never a barrier on the dance floor.",
    languagesTitle: "Classes taught in",
    languages: ["English", "French", "Twi", "Ga", "Ewe", "Fante"],
    experienceTitle: "Beyond the dance floor",
    experience: [
      {
        role: "Translator & Steering Subcommittee Co-Chair",
        org: "D.O.O.R Initiative",
        period: "2025 — today",
        description: "Multilingual translation and interpretation support for Diasporans repatriating to Ghana, helping individuals, community leaders and corporate heads navigate key government processes with clarity and confidence.",
      },
      {
        role: "Freelance Translator & Interpreter",
        org: "Ga · French · Twi · English · Fante · Ewe",
        period: "2017 — today",
        description: "Simultaneous and consecutive interpreting for business meetings, conferences and community events, with a deep feel for the cultural nuances and expressions of each language.",
      },
    ],
    skills: ["Partner dance coaching", "Translation", "Interpretation", "Multilingual communication", "Cross-cultural guidance"],
  },
  trust: {
    eyebrow: "Why people stay in motion",
    titleLine1: "Built on",
    titleLine2: "practice.",
    proofs: [
      { value: "12+", label: "Years in motion", text: "A sustained practice shaped by teaching, rehearsal and performance." },
      { value: "03", label: "Ways to learn", text: "Private coaching, studio sessions and live online guidance for different goals." },
    ],
  },
  events: {
    eyebrow: "Upcoming events",
    titleLine1: "Meet us",
    titleLine2: "in the room.",
    intro: "Keep your practice social. Discover the next dance nights, open classes and community moments around Accra.",
    autoplaySeconds: 7,
    items: [
      {
        id: "bachata-salsa-night",
        published: true,
        status: "Next up",
        schedule: "Every Sunday",
        titleLine1: "Bachata & Salsa",
        titleLine2: "Night.",
        intro: "A free Bachata class to start the evening, followed by social dancing, good music and a welcoming room at Afrikiko.",
        poster: `${MANUS}/qBQRfjkRThHSnihN.jpeg`,
        posterAlt: "Bachata and Salsa Night poster at Afrikiko",
        facts: [
          { label: "Class", value: "7:00 PM — 8:00 PM", sub: "Free Bachata class" },
          { label: "Social", value: "8:00 PM — late", sub: "With Mavé" },
          { label: "Where", value: "Afrikiko", sub: "Eat · Drink · Dance · Vibe" },
          { label: "Format", value: "Open class + social night", sub: "Community dance event" },
          { label: "Contact", value: "Georges West Dance", sub: "+233 54 403 6021" },
        ],
        note: "Starting this Sunday · Accra, Ghana · Details may change, so message the studio before travelling.",
        ctaUrl: "",
      },
    ],
  },
  programs: {
    eyebrow: "Choose your entry point",
    rows: [
      { title: "Private / at home", description: "One-to-one coaching, tailored to your goals, pace and space.", href: "/classes/private" },
      { title: "Studio / together", description: "Structured studio classes where technique, musicality and connection grow together.", href: "/classes/studio" },
      { title: "Online / anywhere", description: "Live masterclasses that bring focused studio guidance to wherever you are.", href: "/classes/online" },
    ],
  },
  courses: {
    private: { eyebrow: "Private / at home", title: "Build confidence\nin your own space.", intro: "Private dance coaching shaped around your goals, your pace and the space where you feel ready to move.", image: `${MANUS}/yuJhiqyyDhDdUIpB.jpg`, format: "Private coaching", place: "Your home · Accra", duration: "60 or 90 minutes", detail: "Whether you are preparing for a first dance, returning to movement or pursuing focused technical progress, every session begins with a clear objective. Georges West brings structured instruction, patient guidance and precise feedback directly to your space.", outcomes: ["A tailored session plan after your first conversation", "Technique, musicality and confidence developed at your pace", "Practical guidance you can repeat between sessions"] },
    studio: { eyebrow: "Studio / together", title: "Learn the language.\nFind your people.", intro: "Structured studio sessions where technique, musicality and connection turn practice into confident performance.", image: `${MANUS}/MjZOAIjMPGAISHoW.jpg`, format: "Small-group or private", place: "Partner studio · Accra", duration: "60 or 90 minutes", detail: "The studio is where individual practice becomes shared energy. Sessions are progressive and focused, moving from foundations into musicality, partner connection and expressive performance.", outcomes: ["A clear progression from fundamentals to performance", "A supportive studio rhythm with focused instruction", "Exercises that connect technique to real music"] },
    online: { eyebrow: "Online / anywhere", title: "Keep moving.\nWherever you are.", intro: "Live masterclasses and personal coaching for dancers who want clear, expert guidance wherever their routine takes them.", image: `${MANUS}/hCYEZDdZpGXIyELO.jpg`, format: "Live video session", place: "Online · worldwide", duration: "60 minutes", detail: "Distance should not interrupt practice. Online sessions are built for clarity, with camera-friendly combinations, direct corrections and a focused structure that keeps your practice moving between classes.", outcomes: ["Live feedback through a simple video setup", "A session adapted to your experience and available space", "A repeatable practice plan for the days between calls"] },
  },
  portfolio: {
    eyebrow: "The archive",
    titleLine1: "See the work",
    titleLine2: "in the wild.",
    text: "Stage performances, competition work and private events — a living record of how practice becomes performance.",
    image: `${MANUS}/aRfxREyYmFddmovj.jpg`,
    imageAlt: "Dancers performing in dramatic stage light",
    chapters: "03",
  },
  booking: {
    eyebrow: "Your next count",
    titleLine1: "Ready when",
    titleLine2: "you are.",
    text: "From Osu to East Legon and beyond, tell us what you want to learn, where you want to move and when you are ready to begin. We’ll recommend the right first step.",
  },
  seo: {
    title: "Georges West Dance — Dance classes in Accra",
    description: "Georges West Dance — private, studio and online dance classes in Accra, Ghana, taught in English, French, Twi, Ga, Ewe and Fante.",
  },
};

/** Parse stored JSON safely; any invalid/older document falls back to defaults section by section. */
export function normalizeContent(raw: unknown): SiteContent {
  const parsed = siteContentSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  if (!raw || typeof raw !== "object") return DEFAULT_CONTENT;
  const merged: Record<string, unknown> = { ...DEFAULT_CONTENT };
  const shape = siteContentSchema.shape as Record<string, z.ZodTypeAny>;
  for (const key of Object.keys(shape)) {
    const candidate = (raw as Record<string, unknown>)[key];
    if (candidate !== undefined && shape[key].safeParse(candidate).success) merged[key] = candidate;
  }
  return siteContentSchema.parse(merged);
}
