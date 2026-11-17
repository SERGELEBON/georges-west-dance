// Admin panel — edit every section of the website (hero slides, texts, George's profile, events, classes...).
// Auth: email + password -> HttpOnly SameSite=Strict session cookie (server/adminAuth.ts). All writes are re-validated server-side.
import { useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ArrowDown, ArrowUp, Check, ExternalLink, History, ImagePlus, LoaderCircle, LogOut, Plus, Save, Trash2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_CONTENT, siteContentSchema, type CourseKey, type HeroSlide, type SiteContent, type SiteEvent } from "@shared/siteContent";

type Path = Array<string | number>;
type Session = { authenticated: boolean; configured: boolean; storage: string };
type Version = { id: string; savedAt: string; size: number };

const api = async <T,>(url: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-GWD-Admin": "1", ...(init.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error((data as { error?: string }).error || `Error ${response.status}`) as Error & { issues?: unknown; status?: number };
    error.issues = (data as { issues?: unknown }).issues;
    error.status = response.status;
    throw error;
  }
  return data as T;
};

function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (!path.length) return value as T;
  const [head, ...rest] = path;
  const clone: any = Array.isArray(obj) ? [...(obj as unknown[])] : { ...(obj as object) };
  clone[head] = setIn(clone[head], rest, value);
  return clone;
}
const getIn = (obj: unknown, path: Path): any => path.reduce((acc: any, key) => acc?.[key], obj);
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- Field components ---------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="adm-field"><span className="adm-label">{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function MediaField({ label, value, onChange, accept = "image/*", hint }: { label: string; value: string; onChange: (v: string) => void; accept?: string; hint?: string }) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const isVideo = /\.(mp4|webm)(\?|$)/i.test(value);

  const onFile = async (file: File) => {
    setError("");
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"];
    if (!allowed.includes(file.type)) { setError("Format not allowed (JPG, PNG, WEBP, AVIF, MP4, WEBM)."); return; }
    if (file.size > 200 * 1024 * 1024) { setError("File too large (200 MB max)."); return; }
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/^-+/, "").slice(-80) || "file";
    try {
      setBusy(1);
      const blob = await upload(`media/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        headers: { "X-GWD-Admin": "1" },
        onUploadProgress: ({ percentage }) => setBusy(Math.max(1, Math.round(percentage))),
      });
      onChange(blob.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(0);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="adm-field adm-media">
      <span className="adm-label">{label}</span>
      <div className="adm-media-row">
        <div className="adm-media-preview">{value ? (isVideo ? <video src={value} muted playsInline preload="metadata" /> : <img src={value} alt="" />) : <ImagePlus size={20} />}</div>
        <div className="adm-media-controls">
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="https://… or /media/…" spellCheck={false} />
          <div className="adm-media-actions">
            <button type="button" className="adm-btn" onClick={() => input.current?.click()} disabled={busy > 0}>{busy ? <><LoaderCircle className="adm-spin" size={14} /> {busy}%</> : <><Upload size={14} /> Upload</>}</button>
            {value && <a className="adm-btn adm-btn--ghost" href={value} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Open</a>}
            {value && <button type="button" className="adm-btn adm-btn--ghost" onClick={() => onChange("")}><Trash2 size={14} /> Remove</button>}
          </div>
          <input ref={input} type="file" accept={accept} hidden onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
          {hint && <small>{hint}</small>}
          {error && <small className="adm-error">{error}</small>}
        </div>
      </div>
    </div>
  );
}

function ListControls({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (from: number, to: number) => void; onRemove: () => void }) {
  return (
    <div className="adm-list-controls">
      <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0} aria-label="Move up"><ArrowUp size={14} /></button>
      <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
      <button type="button" onClick={() => { if (window.confirm("Delete this item?")) onRemove(); }} aria-label="Delete"><Trash2 size={14} /></button>
    </div>
  );
}

/* ---------- Main ---------- */

const TABS = [
  ["hero", "Hero & slides"], ["about", "About"], ["george", "George (profile)"], ["events", "Events"],
  ["classes", "Classes"], ["portfolio", "Portfolio & booking"], ["contact", "Contact & brand"], ["sections", "Show / hide sections"], ["history", "History"], ["account", "Account (sign-in)"],
] as const;
type Tab = (typeof TABS)[number][0];

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    document.title = "Admin — Georges West Dance";
    api<Session>("/api/admin/session").then(setSession).catch(() => setSession({ authenticated: false, configured: false, storage: "unknown" }));
    return () => { robots.remove(); };
  }, []);

  if (!session) return <div className="admin-loading">Loading…</div>;
  if (!session.authenticated) return <Login configured={session.configured} onSuccess={() => api<Session>("/api/admin/session").then(setSession)} />;
  return <Editor storage={session.storage} onLogout={() => setSession({ ...session, authenticated: false })} />;
}

function Login({ configured, onSuccess }: { configured: boolean; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setPassword("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        <p className="adm-kicker">Georges West Dance</p>
        <h1>Admin</h1>
        {!configured && <p className="adm-error">Admin is not configured yet: add ADMIN_PASSWORD (12+ characters) and ADMIN_SESSION_SECRET (32+ characters) in Vercel → Settings → Environment Variables, then redeploy.</p>}
        <Field label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required maxLength={254} autoFocus /></Field>
        <Field label="Password"><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required maxLength={200} /></Field>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn--primary" disabled={busy || !password || !email}>{busy ? <LoaderCircle className="adm-spin" size={15} /> : null} Sign in</button>
        <a className="adm-back" href="/">← Back to the website</a>
      </form>
    </div>
  );
}

function Editor({ storage, onLogout }: { storage: string; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<SiteContent>(DEFAULT_CONTENT);
  const [tab, setTab] = useState<Tab>("hero");
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; message?: string; issues?: Array<{ path: string; message: string }> }>({ kind: "idle" });
  const dirty = useMemo(() => saved !== null && JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  useEffect(() => {
    api<SiteContent>("/api/admin/content").then(c => { setSaved(c); setDraft(c); }).catch(e => (e.status === 401 ? onLogout() : setStatus({ kind: "error", message: e.message })));
  }, [onLogout]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (path: Path, value: unknown) => setDraft(d => setIn(d, path, value));
  const val = (path: Path) => getIn(draft, path);
  const txt = (label: string, path: Path, opts: { area?: boolean; hint?: string; rows?: number } = {}) => (
    <Field label={label} hint={opts.hint}>
      {opts.area ? <textarea rows={opts.rows || 4} value={val(path) ?? ""} onChange={e => set(path, e.target.value)} /> : <input type="text" value={val(path) ?? ""} onChange={e => set(path, e.target.value)} />}
    </Field>
  );
  const media = (label: string, path: Path, accept?: string, hint?: string) => <MediaField label={label} value={val(path) ?? ""} onChange={v => set(path, v)} accept={accept} hint={hint} />;
  const move = (path: Path) => (from: number, to: number) => {
    const list = [...(val(path) as unknown[])];
    if (to < 0 || to >= list.length) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    set(path, list);
  };
  const remove = (path: Path, index: number) => set(path, (val(path) as unknown[]).filter((_, i) => i !== index));
  const add = (path: Path, item: unknown) => set(path, [...(val(path) as unknown[]), item]);
  const stringList = (label: string, path: Path, hint = "One item per line") => (
    <Field label={label} hint={hint}><textarea rows={4} value={(val(path) as string[]).join("\n")} onChange={e => set(path, e.target.value.split("\n"))} /></Field>
  );

  const save = async () => {
    const clean = (list: string[]) => list.map(s => s.trim()).filter(Boolean);
    let prepared = setIn(draft, ["george", "languages"], clean(draft.george.languages));
    prepared = setIn(prepared, ["george", "skills"], clean(draft.george.skills));
    for (const key of ["private", "studio", "online"] as CourseKey[]) prepared = setIn(prepared, ["courses", key, "outcomes"], clean(draft.courses[key].outcomes));
    const local = siteContentSchema.safeParse(prepared);
    if (!local.success) {
      setStatus({ kind: "error", message: "Some fields need attention", issues: local.error.issues.slice(0, 12).map(i => ({ path: i.path.join(" › "), message: i.message })) });
      return;
    }
    setStatus({ kind: "saving" });
    try {
      await api("/api/admin/content", { method: "PUT", body: JSON.stringify(local.data) });
      setSaved(local.data);
      setDraft(local.data);
      queryClient.setQueryData(["site-content"], local.data);
      setStatus({ kind: "ok", message: "Saved — the public site updates within ~30 seconds." });
    } catch (e) {
      const err = e as Error & { issues?: Array<{ path: string; message: string }>; status?: number };
      if (err.status === 401) return onLogout();
      setStatus({ kind: "error", message: err.message, issues: err.issues });
    }
  };

  const logout = async () => {
    if (dirty && !window.confirm("You have unsaved changes. Log out anyway?")) return;
    await api("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    onLogout();
  };

  if (!saved) return <div className="admin-loading">{status.kind === "error" ? status.message : "Loading content…"}</div>;

  const newSlide = (): HeroSlide => ({ id: uid(), type: "video", src: "", mobileSrc: "", poster: "", alt: "", fit: "cover", grayscale: false, duration: 8 });
  const newEvent = (): SiteEvent => ({ id: uid(), published: false, status: "Next up", schedule: "", titleLine1: "New event", titleLine2: "", intro: "", poster: "", posterAlt: "", facts: [], note: "", ctaUrl: "" });

  return (
    <div className="adm">
      <header className="adm-top">
        <div><strong>GWD Admin</strong><span className={`adm-pill ${storage === "vercel-blob" ? "ok" : "warn"}`}>{storage === "vercel-blob" ? "Vercel Blob connected" : "Local storage (dev)"}</span></div>
        <div className="adm-top-actions">
          {dirty && <span className="adm-dirty">Unsaved changes</span>}
          <a className="adm-btn adm-btn--ghost" href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> View site</a>
          <button className="adm-btn adm-btn--ghost" onClick={() => { if (window.confirm("Discard all unsaved changes?")) setDraft(saved); }} disabled={!dirty}>Discard</button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={!dirty || status.kind === "saving"}>{status.kind === "saving" ? <LoaderCircle className="adm-spin" size={15} /> : <Save size={15} />} Save & publish</button>
          <button className="adm-btn adm-btn--ghost" onClick={logout} aria-label="Log out"><LogOut size={15} /></button>
        </div>
      </header>
      {status.kind === "ok" && <div className="adm-banner ok"><Check size={15} /> {status.message}</div>}
      {status.kind === "error" && <div className="adm-banner error"><strong>{status.message}</strong>{status.issues?.map(i => <span key={i.path + i.message}>{i.path}: {i.message}</span>)}</div>}

      <div className="adm-body">
        <nav className="adm-tabs">{TABS.map(([key, label]) => <button key={key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>{label}</button>)}</nav>
        <main className="adm-panel">
          {tab === "hero" && <>
            <h2>Hero</h2>
            <div className="adm-grid">{txt("Eyebrow", ["hero", "eyebrow"])}{txt("Title — line 1", ["hero", "titleLine1"])}{txt("Title — line 2 (highlighted)", ["hero", "titleLine2"])}{txt("Main button", ["hero", "primaryCta"])}{txt("Secondary button", ["hero", "secondaryCta"])}</div>
            {txt("Intro text", ["hero", "lede"], { area: true, rows: 3 })}
            <h3>Slides <small>Videos play to the end, then the next slide starts. Images stay for their duration.</small></h3>
            {draft.hero.slides.map((slide, i) => (
              <div className="adm-card" key={slide.id}>
                <div className="adm-card-head"><strong>Slide {i + 1}</strong><ListControls index={i} length={draft.hero.slides.length} onMove={move(["hero", "slides"])} onRemove={() => remove(["hero", "slides"], i)} /></div>
                <div className="adm-grid">
                  <Field label="Type"><select value={slide.type} onChange={e => set(["hero", "slides", i, "type"], e.target.value)}><option value="video">Video</option><option value="image">Image</option></select></Field>
                  <Field label="Framing" hint="Use “blur” for a vertical video that has no landscape version."><select value={slide.fit} onChange={e => set(["hero", "slides", i, "fit"], e.target.value)}><option value="cover">Fill the screen (cover)</option><option value="blur">Whole video over blurred background</option></select></Field>
                  {slide.type === "image" && <Field label="Duration (seconds)"><input type="number" min={3} max={60} value={slide.duration} onChange={e => set(["hero", "slides", i, "duration"], Number(e.target.value) || 8)} /></Field>}
                  <Field label="Black & white"><input type="checkbox" checked={slide.grayscale} onChange={e => set(["hero", "slides", i, "grayscale"], e.target.checked)} /></Field>
                </div>
                {media(slide.type === "video" ? "Video — desktop / landscape (16:9, MP4 H.264, ≤ 20 s, ≤ 8 MB ideal)" : "Image (landscape, ≥ 1600 px wide)", ["hero", "slides", i, "src"], slide.type === "video" ? "video/mp4,video/webm" : "image/*")}
                {media("Phone version — portrait (optional, 9:16)", ["hero", "slides", i, "mobileSrc"], slide.type === "video" ? "video/mp4,video/webm" : "image/*", "Shown on phones held upright. If empty, the desktop file is used.")}
                {slide.type === "video" && media("Poster image (first frame, shown while loading)", ["hero", "slides", i, "poster"])}
                {txt("Description (accessibility)", ["hero", "slides", i, "alt"])}
              </div>
            ))}
            {draft.hero.slides.length < 8 && <button className="adm-btn" onClick={() => add(["hero", "slides"], newSlide())}><Plus size={14} /> Add slide</button>}
          </>}

          {tab === "about" && <>
            <h2>About</h2>
            <div className="adm-grid">{txt("Eyebrow", ["about", "eyebrow"])}{txt("Title — line 1", ["about", "titleLine1"])}{txt("Title — line 2", ["about", "titleLine2"])}</div>
            {txt("Text", ["about", "body"], { area: true, rows: 5 })}
            <h3>Key figures</h3>
            {draft.about.stats.map((_, i) => <div className="adm-card adm-row" key={i}>{txt("Value", ["about", "stats", i, "value"])}{txt("Label", ["about", "stats", i, "label"])}<ListControls index={i} length={draft.about.stats.length} onMove={move(["about", "stats"])} onRemove={() => remove(["about", "stats"], i)} /></div>)}
            {draft.about.stats.length < 4 && <button className="adm-btn" onClick={() => add(["about", "stats"], { value: "", label: "" })}><Plus size={14} /> Add figure</button>}
            <h3>“Why people stay” block</h3>
            <div className="adm-grid">{txt("Eyebrow", ["trust", "eyebrow"])}{txt("Title — line 1", ["trust", "titleLine1"])}{txt("Title — line 2", ["trust", "titleLine2"])}</div>
            {draft.trust.proofs.map((_, i) => <div className="adm-card" key={i}><div className="adm-card-head"><strong>Proof {i + 1}</strong><ListControls index={i} length={draft.trust.proofs.length} onMove={move(["trust", "proofs"])} onRemove={() => remove(["trust", "proofs"], i)} /></div><div className="adm-grid">{txt("Value", ["trust", "proofs", i, "value"])}{txt("Label", ["trust", "proofs", i, "label"])}</div>{txt("Text", ["trust", "proofs", i, "text"], { area: true, rows: 2 })}</div>)}
            {draft.trust.proofs.length < 3 && <button className="adm-btn" onClick={() => add(["trust", "proofs"], { value: "", label: "", text: "" })}><Plus size={14} /> Add proof</button>}
          </>}

          {tab === "george" && <>
            <h2>George — portfolio</h2>
            <div className="adm-grid">{txt("Eyebrow", ["george", "eyebrow"])}{txt("Name", ["george", "name"])}</div>
            {txt("Headline", ["george", "headline"])}
            {media("Photo (portrait)", ["george", "photo"])}
            {txt("Photo description", ["george", "photoAlt"])}
            {txt("Biography", ["george", "bio"], { area: true, rows: 6 })}
            {txt("Languages title", ["george", "languagesTitle"])}
            {stringList("Languages", ["george", "languages"])}
            {stringList("Skills", ["george", "skills"])}
            <h3>Experience</h3>
            {txt("Experience title", ["george", "experienceTitle"])}
            {draft.george.experience.map((_, i) => <div className="adm-card" key={i}><div className="adm-card-head"><strong>Experience {i + 1}</strong><ListControls index={i} length={draft.george.experience.length} onMove={move(["george", "experience"])} onRemove={() => remove(["george", "experience"], i)} /></div><div className="adm-grid">{txt("Role", ["george", "experience", i, "role"])}{txt("Organisation", ["george", "experience", i, "org"])}{txt("Period", ["george", "experience", i, "period"])}</div>{txt("Description", ["george", "experience", i, "description"], { area: true, rows: 3 })}</div>)}
            {draft.george.experience.length < 8 && <button className="adm-btn" onClick={() => add(["george", "experience"], { role: "", org: "", period: "", description: "" })}><Plus size={14} /> Add experience</button>}
          </>}

          {tab === "events" && <>
            <h2>Events</h2>
            <div className="adm-grid">{txt("Eyebrow", ["events", "eyebrow"])}{txt("Title — line 1", ["events", "titleLine1"])}{txt("Title — line 2", ["events", "titleLine2"])}</div>
            {txt("Intro", ["events", "intro"], { area: true, rows: 2 })}
            <Field label="Slideshow — seconds per event" hint="With 2+ published events they play as slides (one per event). 0 = no auto-scroll. Use the arrows on each card to set the order."><input type="number" min={0} max={30} step={1} value={draft.events.autoplaySeconds} onChange={e => set(["events", "autoplaySeconds"], Math.max(0, Math.min(30, Math.round(Number(e.target.value) || 0))))} /></Field>
            {draft.events.items.map((event, i) => (
              <div className={`adm-card ${event.published ? "" : "is-muted"}`} key={event.id}>
                <div className="adm-card-head"><strong>{event.titleLine1 || "Event"} {event.published ? "" : "(hidden)"}</strong><label className="adm-switch"><input type="checkbox" checked={event.published} onChange={e => set(["events", "items", i, "published"], e.target.checked)} /> Published</label><ListControls index={i} length={draft.events.items.length} onMove={move(["events", "items"])} onRemove={() => remove(["events", "items"], i)} /></div>
                <div className="adm-grid">{txt("Badge", ["events", "items", i, "status"])}{txt("When (e.g. Every Sunday)", ["events", "items", i, "schedule"])}{txt("Title — line 1", ["events", "items", i, "titleLine1"])}{txt("Title — line 2", ["events", "items", i, "titleLine2"])}</div>
                {txt("Description", ["events", "items", i, "intro"], { area: true, rows: 3 })}
                {media("Poster / flyer", ["events", "items", i, "poster"])}
                {txt("Poster description", ["events", "items", i, "posterAlt"])}
                <h4>Details</h4>
                {event.facts.map((_, f) => <div className="adm-row" key={f}>{txt("Label", ["events", "items", i, "facts", f, "label"])}{txt("Value", ["events", "items", i, "facts", f, "value"])}{txt("Detail", ["events", "items", i, "facts", f, "sub"])}<ListControls index={f} length={event.facts.length} onMove={move(["events", "items", i, "facts"])} onRemove={() => remove(["events", "items", i, "facts"], f)} /></div>)}
                {event.facts.length < 8 && <button className="adm-btn adm-btn--ghost" onClick={() => add(["events", "items", i, "facts"], { label: "", value: "", sub: "" })}><Plus size={14} /> Add detail</button>}
                {txt("Small note", ["events", "items", i, "note"])}
                {txt("Button link (optional — WhatsApp by default)", ["events", "items", i, "ctaUrl"])}
              </div>
            ))}
            {draft.events.items.length < 12 && <button className="adm-btn" onClick={() => add(["events", "items"], newEvent())}><Plus size={14} /> Add event</button>}
          </>}

          {tab === "classes" && <>
            <h2>Classes</h2>
            {txt("Section eyebrow", ["programs", "eyebrow"])}
            {draft.programs.rows.map((_, i) => <div className="adm-card" key={i}><div className="adm-card-head"><strong>Entry {i + 1}</strong><ListControls index={i} length={draft.programs.rows.length} onMove={move(["programs", "rows"])} onRemove={() => remove(["programs", "rows"], i)} /></div><div className="adm-grid">{txt("Title", ["programs", "rows", i, "title"])}{txt("Link", ["programs", "rows", i, "href"], { hint: "/classes/private, /classes/studio, /classes/online or https://…" })}</div>{txt("Description", ["programs", "rows", i, "description"], { area: true, rows: 2 })}</div>)}
            {draft.programs.rows.length < 6 && <button className="adm-btn" onClick={() => add(["programs", "rows"], { title: "", description: "", href: "" })}><Plus size={14} /> Add entry</button>}
            {(["private", "studio", "online"] as CourseKey[]).map(key => (
              <div className="adm-card" key={key}>
                <div className="adm-card-head"><strong>Page /classes/{key}</strong><a href={`/classes/${key}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--ghost"><ExternalLink size={14} /> Open</a></div>
                <div className="adm-grid">{txt("Eyebrow", ["courses", key, "eyebrow"])}{txt("Format", ["courses", key, "format"])}{txt("Place", ["courses", key, "place"])}{txt("Duration", ["courses", key, "duration"])}</div>
                {txt("Title (line break = new line)", ["courses", key, "title"], { area: true, rows: 2 })}
                {txt("Intro", ["courses", key, "intro"], { area: true, rows: 2 })}
                {media("Image", ["courses", key, "image"])}
                {txt("Detail", ["courses", key, "detail"], { area: true, rows: 4 })}
                {stringList("What students leave with", ["courses", key, "outcomes"])}
              </div>
            ))}
          </>}

          {tab === "portfolio" && <>
            <h2>Portfolio</h2>
            <div className="adm-grid">{txt("Eyebrow", ["portfolio", "eyebrow"])}{txt("Title — line 1", ["portfolio", "titleLine1"])}{txt("Title — line 2", ["portfolio", "titleLine2"])}{txt("Chapters count", ["portfolio", "chapters"])}</div>
            {txt("Text", ["portfolio", "text"], { area: true, rows: 3 })}
            {media("Image", ["portfolio", "image"])}
            {txt("Image description", ["portfolio", "imageAlt"])}
            <h2>Booking</h2>
            <div className="adm-grid">{txt("Eyebrow", ["booking", "eyebrow"])}{txt("Title — line 1", ["booking", "titleLine1"])}{txt("Title — line 2", ["booking", "titleLine2"])}</div>
            {txt("Text", ["booking", "text"], { area: true, rows: 3 })}
          </>}

          {tab === "contact" && <>
            <h2>Contact & social</h2>
            <div className="adm-grid">{txt("Phone (displayed)", ["contact", "phone"])}{txt("WhatsApp number", ["contact", "whatsappNumber"], { hint: "Digits only with country code, e.g. 233544036021" })}{txt("Email", ["contact", "email"])}{txt("Location", ["contact", "location"])}</div>
            {txt("WhatsApp pre-filled message", ["contact", "whatsappMessage"])}
            <div className="adm-grid">{txt("YouTube URL", ["contact", "youtubeUrl"])}{txt("Instagram URL", ["contact", "instagramUrl"])}{txt("LinkedIn URL", ["contact", "linkedinUrl"])}</div>
            <h2>Brand</h2>
            {media("Logo", ["brand", "logo"])}
            {txt("Top banner text", ["brand", "announcement"])}
            {txt("Footer tagline", ["brand", "footerTagline"])}
            <h2>SEO (Google)</h2>
            {txt("Page title (≤ 70 characters)", ["seo", "title"])}
            {txt("Description (≤ 170 characters)", ["seo", "description"], { area: true, rows: 2 })}
          </>}

          {tab === "sections" && <>
            <h2>Show / hide sections</h2>
            <div className="adm-toggles">{(Object.keys(draft.sections) as Array<keyof SiteContent["sections"]>).map(key => <label className="adm-switch" key={key}><input type="checkbox" checked={draft.sections[key]} onChange={e => set(["sections", key], e.target.checked)} /> {key}</label>)}</div>
          </>}

          {tab === "account" && <AccountSettings />}
          {tab === "history" && <VersionHistory onRestored={c => { setSaved(c); setDraft(c); queryClient.setQueryData(["site-content"], c); }} />}
        </main>
      </div>
    </div>
  );
}

function VersionHistory({ onRestored }: { onRestored: (c: SiteContent) => void }) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [error, setError] = useState("");
  const load = () => api<Version[]>("/api/admin/versions").then(setVersions).catch(e => setError(e.message));
  useEffect(() => { void load(); }, []);
  const restore = async (id: string) => {
    if (!window.confirm("Restore this version? It becomes the live content (current content stays in history).")) return;
    try { onRestored(await api<SiteContent>("/api/admin/versions/restore", { method: "POST", body: JSON.stringify({ id }) })); void load(); } catch (e) { setError(e instanceof Error ? e.message : "Restore failed"); }
  };
  return <>
    <h2><History size={18} /> History</h2>
    <p className="adm-muted">The last 25 saves are kept. Restoring creates a new save.</p>
    {error && <p className="adm-error">{error}</p>}
    {!versions ? <p>Loading…</p> : versions.length === 0 ? <p className="adm-muted">No saved version yet — the site shows the default content.</p> : (
      <ul className="adm-versions">{versions.map((v, i) => <li key={v.id}><span>{new Date(v.savedAt).toLocaleString()}</span>{i === 0 ? <em>Live</em> : <button className="adm-btn adm-btn--ghost" onClick={() => restore(v.id)}>Restore</button>}</li>)}</ul>
    )}
  </>;
}

/* ---------- Account: sign-in email + password ---------- */

function AccountSettings() {
  const [current, setCurrent] = useState<{ email: string; source: string } | null>(null);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; message?: string }>({ kind: "idle" });

  useEffect(() => {
    api<{ email: string; source: string }>("/api/admin/account").then(a => { setCurrent(a); setEmail(a.email); }).catch(e => setStatus({ kind: "error", message: e.message }));
  }, []);

  const mismatch = newPassword !== "" && confirm !== "" && newPassword !== confirm;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirm) { setStatus({ kind: "error", message: "The two new passwords do not match." }); return; }
    setStatus({ kind: "busy" });
    try {
      const r = await api<{ email: string }>("/api/admin/account", { method: "PUT", body: JSON.stringify({ email, currentPassword, newPassword }) });
      setCurrent({ email: r.email, source: "dashboard" });
      setCurrentPassword(""); setNewPassword(""); setConfirm("");
      setStatus({ kind: "ok", message: "Saved. Use these details next time you sign in. Other open sessions were signed out." });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Could not save" });
    }
  };

  return (
    <form onSubmit={submit} autoComplete="off">
      <h2>Account (sign-in)</h2>
      <p className="adm-note">Signed in as <strong>{current?.email || "…"}</strong>{current?.source === "env" ? " — initial details from Vercel settings. Saving here replaces them." : "."}</p>
      <Field label="Sign-in email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} autoComplete="username" /></Field>
      <Field label="New password" hint="Leave empty to keep the current password. 12+ characters, letters and numbers or symbols."><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} maxLength={200} minLength={12} autoComplete="new-password" /></Field>
      <Field label="Confirm new password"><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} maxLength={200} autoComplete="new-password" /></Field>
      {mismatch && <p className="adm-error">The two new passwords do not match.</p>}
      <Field label="Current password (required to save)"><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required maxLength={200} autoComplete="current-password" /></Field>
      {status.kind === "error" && <p className="adm-error" role="alert">{status.message}</p>}
      {status.kind === "ok" && <p className="adm-ok" role="status"><Check size={14} /> {status.message}</p>}
      <button className="adm-btn adm-btn--primary" disabled={status.kind === "busy" || !currentPassword || !email || mismatch}>
        {status.kind === "busy" ? <LoaderCircle className="adm-spin" size={15} /> : <Save size={15} />} Save sign-in details
      </button>
    </form>
  );
}
