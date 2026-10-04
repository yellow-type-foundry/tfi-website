import { MobileSteppedHeading } from "../components/MobileSteppedHeading";
import type { ReactElement } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useLoop";
import { Eyebrow } from "../components/Eyebrow";
import { NumberBadge } from "../components/Badge";
import { IconContainer } from "../components/IconContainer";
import { Icon } from "../components/Icon";
import { VectorLoop } from "../components/VectorLoop";
import "./InteractiveDemo.css";

/* Local stand-ins for SF Symbols lock.fill, person.fill and arrow.clockwise. */
type LocalIconName = "lock" | "person" | "refresh";
const localPaths: Record<LocalIconName, ReactElement> = {
  lock: (
    <path d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A2.5 2.5 0 0 1 20 12.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-7A2.5 2.5 0 0 1 6.5 10H7Zm2.6 0h4.8V7.5a2.4 2.4 0 0 0-4.8 0V10Z" />
  ),
  person: (
    <>
      <circle cx="12" cy="7.5" r="4.5" />
      <path d="M3.5 20.2c0-3.6 3.8-6.2 8.5-6.2s8.5 2.6 8.5 6.2c0 1-.8 1.8-1.8 1.8H5.3c-1 0-1.8-.8-1.8-1.8Z" />
    </>
  ),
  refresh: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M18.5 3v4.5H14" />
    </g>
  ),
};
const LocalIcon = ({ name, size }: { name: LocalIconName; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    {localPaths[name]}
  </svg>
);

/* Illustration of an agent run (the Figma "Interactive Demo" frame), played as one timeline:
   sign in with vault credentials and a 2FA code, go to Billing, filter to unpaid invoices, read them,
   then hand JSON to the agent. Nothing here is interactive; the window is a picture of the product,
   hidden from assistive tech and described by the section heading instead. */
const RUN_STEPS = [
  { id: "open", label: "Open the portal", end: 600 },
  { id: "email", label: "Enter email", end: 1200 },
  { id: "password", label: "Enter password", end: 2150 },
  { id: "code", label: "Enter 2FA code", end: 3000 },
  { id: "billing", label: "Go to Billing", end: 5750 },
  { id: "extract", label: "Read the invoices", end: 7300 },
  { id: "send", label: "Send JSON to your agent", end: 8900 },
] as const;
const PHASES = [
  { label: "Log in", from: 0, to: 4 },
  { label: "Navigate", from: 4, to: 5 },
  { label: "Complete", from: 5, to: RUN_STEPS.length },
];
const DONE = RUN_STEPS[RUN_STEPS.length - 1].end; // 8.9s
const RESULT_AT = RUN_STEPS[RUN_STEPS.length - 2].end; // the JSON card opens when reading ends
const LOOP = DONE + 3200;
const CLICKS = [800, 1400, 2000, 2450, 3950, 5000, 5650]; // the cursor taps just after these
const EMAIL = "ops@yourco.com";
const CODE = "482913";
const ALL_INVOICES = [
  ["INV-2036", "Sep 18", "$2,380.00", "Paid"], ["INV-2041", "Oct 01", "$4,210.00", "Unpaid"],
  ["INV-2038", "Sep 24", "$615.40", "Paid"], ["INV-2042", "Oct 08", "$1,875.50", "Unpaid"],
  ["INV-2039", "Sep 27", "$1,120.00", "Paid"], ["INV-2043", "Oct 15", "$920.00", "Unpaid"],
];
const UNPAID = ALL_INVOICES.filter((r) => r[3] === "Unpaid");
/* [plain, highlighted, highlighted on phones] */
const JSON_LINES: [string, string?, string?][] = [
  ["{"], ['  "status": ', '"done",'], ['  "invoices": ['],
  ['    { "id": ', '"INV-2041", "due": "Oct 01", "amount": 4210 },', '"INV-2041", "amount": 4210 },'],
  ['    { "id": ', '"INV-2042", "due": "Oct 08", "amount": 1875.5 },', '"INV-2042", "amount": 1875 },'],
  ['    { "id": ', '"INV-2043", "due": "Oct 15", "amount": 920 },', '"INV-2043", "amount": 920 },'],
  ["    ", "… 9 more"], ["  ],"], ['  "replay": ', '"runs/7f3a"'], ["}"],
];
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Milliseconds into the run. Plays on a loop while on screen and pauses off screen (resuming where it
    left off); with reduced motion it shows the finished run. */
function useRunClock(inView: boolean) {
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(DONE); return; }
    if (!inView) return;
    const start = performance.now() - tRef.current;
    let raf = 0;
    const tick = (now: number) => {
      const next = (now - start) % LOOP;
      tRef.current = next;
      setT((prev) => (Math.abs(prev - next) < 32 && next >= prev ? prev : next)); // ~30fps is plenty
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);
  return t;
}

/** Where the agent's cursor is at time t: a data-mark inside the window body, "hold" to stay put, or null to hide. */
function pointerTarget(t: number, rowsDone: number) {
  if (t < 600) return null;
  if (t < 1200) return "email";
  if (t < 1800) return "password";
  if (t < 2150) return "continue";
  if (t < 3000) return "code";
  if (t < 3500) return "hold";
  if (t < 4600) return "billing";
  if (t < 5300) return "filter";
  if (t < 5800) return "option";
  if (t < 5950) return "hold";
  if (t < RESULT_AT) return `row${clamp(rowsDone - 1, 0, UNPAID.length - 1)}`;
  return null;
}

/** Moves the cursor (CSS transitions the move) over its target, measured from the rendered window body. */
function usePointer(bodyRef: React.RefObject<HTMLDivElement | null>, pointerRef: React.RefObject<HTMLSpanElement | null>, target: string | null) {
  useLayoutEffect(() => {
    const body = bodyRef.current, pointer = pointerRef.current;
    if (!body || !pointer || target === "hold") return;
    const el = target ? body.querySelector(`[data-mark="${target}"]`) : null;
    if (!el) { pointer.style.opacity = "0"; return; }
    const b = body.getBoundingClientRect(), r = el.getBoundingClientRect();
    const transform = `translate(${r.left - b.left + Math.min(r.width * 0.5, 150)}px, ${r.top - b.top + r.height * 0.4}px)`;
    if (pointer.style.opacity !== "1") { // appear in place rather than flying in from the corner
      pointer.style.transition = "none"; pointer.style.transform = transform; void pointer.offsetWidth;
      pointer.style.transition = ""; pointer.style.opacity = "1";
    } else pointer.style.transform = transform;
  }, [bodyRef, pointerRef, target]);
}

const STEP_ICONS: Record<(typeof RUN_STEPS)[number]["id"], ReactElement> = {
  open: <Icon name="globe" size={12} />, email: <LocalIcon name="person" size={12} />, password: <LocalIcon name="lock" size={12} />,
  code: <LocalIcon name="lock" size={12} />, billing: <Icon name="arrow-right" size={12} />, extract: <Icon name="search" size={12} />,
  send: <Icon name="arrow-right" size={12} />,
};

const VaultNote = ({ children, shown = true }: { children: string; shown?: boolean }) => (
  <span className="idemo-note t-body-xs" style={{ opacity: shown ? 1 : 0 }}><LocalIcon name="lock" size={11} />{children}</span>
);

function SignInCard({ t }: { t: number }) {
  const verify = t >= 2150;
  const emailIn = t >= 800, passwordIn = t >= 1400, codeIn = t >= 2450;
  return (
    <div key={verify ? "verify" : "signin"} className="idemo-card idemo-appear depth-default">
      <p className="idemo-card__eyebrow t-label-s">Acme Supplier Portal</p>
      <p className="idemo-card__title t-h5">{verify ? "Verify it’s you" : "Sign In"}</p>
      {verify ? (
        <>
          <p className="idemo-card__body t-body-s">Enter the 6-digit code from your authenticator app.</p>
          <div className="idemo-code" data-mark="code">
            {CODE.split("").map((d, i) => (
              <span key={i} className="idemo-code__digit t-h6">{codeIn ? d : ""}</span>
            ))}
          </div>
          <VaultNote>One-time code from 1Password</VaultNote>
        </>
      ) : (
        <>
          <div className="idemo-input">
            <span className="t-label-m">Email</span>
            <span data-mark="email" className="idemo-input__field depth-subtle">
              <span className="idemo-input__value t-body-m">{emailIn ? EMAIL : <span className="idemo-input__caret" />}</span>
              {emailIn && <span className="idemo-input__vault t-label-s">1Password</span>}
            </span>
          </div>
          <div className="idemo-input">
            <span className="t-label-m">Password</span>
            <span data-mark="password" className="idemo-input__field depth-subtle">
              <span className="idemo-input__value t-body-m">{passwordIn ? "••••••••••" : t >= 1200 ? <span className="idemo-input__caret" /> : null}</span>
              {passwordIn && <span className="idemo-input__vault t-label-s">1Password</span>}
            </span>
            <VaultNote shown={passwordIn}>Filled by TinyFish · hidden from the model</VaultNote>
          </div>
          <span data-mark="continue" className={`btn btn--l btn--secondary idemo-card__submit${passwordIn ? " is-ready" : ""}${t >= 2000 && t < 2150 ? " is-pressed" : ""}`}>
            <span className="btn__label">Continue</span>
          </span>
        </>
      )}
    </div>
  );
}

function PortalHome() {
  const bar = (w: number | string, h = 8) => <span className="idemo-skel" style={{ width: w, height: h }} />;
  return (
    <div className="idemo-portal__page idemo-appear">
      <div className="idemo-portal__title-row"><p className="t-h6">Welcome back, Ops</p>{bar(96, 24)}</div>
      <div className="idemo-stats">
        {[["Open invoices", "12"], ["Due this week", "$8,245"], ["Paid in Feb", "$52,180"]].map(([k, v]) => (
          <div key={k} className="idemo-stat"><span className="t-body-xs">{k}</span><span className="t-h6">{v}</span>{bar("70%", 6)}</div>
        ))}
      </div>
      <div className="idemo-table">
        <div className="idemo-table__head t-label-s">Recent orders</div>
        {[[64, 88, "Shipped"], [58, 72, "Pending"], [70, 96, "Shipped"], [52, 80, "Shipped"]].map(([a, b, s], i) => (
          <div key={i} className="idemo-table__row idemo-table__row--skel">{bar(`${a}%`)}{bar(`${b}%`)}<span className={`idemo-tag t-body-xs${s === "Shipped" ? " is-good" : ""}`}>{s}</span></div>
        ))}
      </div>
    </div>
  );
}

function PortalInvoices({ t, rowsDone }: { t: number; rowsDone: number }) {
  const open = t >= 5000 && t < 5770, pick = t >= 5550, filtered = t >= 5750;
  const tap = (at: number) => (t >= at && t < at + 160 ? " is-pressed" : "");
  const rows = filtered ? UNPAID : ALL_INVOICES;
  return (
    <div className="idemo-portal__page idemo-appear">
      <div className="idemo-portal__title-row">
        <p className="t-h6">Invoices</p>
        <span key={String(filtered)} className={`idemo-appear t-body-xs${filtered ? " idemo-good" : " idemo-muted"}`}>{filtered ? "12 found" : "48 invoices"}</span>
      </div>
      <div className="idemo-filters">
        <span data-mark="filter" className={`idemo-chip t-body-xs${open || filtered ? " is-on" : ""}${tap(5000)}`}>Status: {filtered ? "Unpaid" : "All"} ▾</span>
        <span className="idemo-chip t-body-xs">Sort: Due date</span>
        {open && (
          <div className="idemo-menu idemo-appear">
            {["Paid", "Unpaid", "Overdue"].map((o) => (
              <span key={o} data-mark={o === "Unpaid" ? "option" : undefined} className={`idemo-menu__item t-body-xs${o === "Unpaid" && pick ? " is-on" : ""}${o === "Unpaid" ? tap(5650) : ""}`}>{o}</span>
            ))}
          </div>
        )}
      </div>
      <div className="idemo-table">
        <div className="idemo-table__head idemo-table__grid t-body-xs"><span>Invoice</span><span className="idemo-due">Due</span><span className="idemo-right">Amount</span><span /></div>
        <div key={String(filtered)} className="idemo-appear">
          {rows.map((r, i) => {
            const done = filtered && i < rowsDone;
            return (
              <div key={r[0]} data-mark={filtered ? `row${i}` : undefined} className="idemo-table__row idemo-table__grid t-mono-s">
                <span>{r[0]}</span><span className="idemo-due idemo-muted">{r[1]}</span><span className="idemo-right">{r[2]}</span>
                <span className="idemo-right">{done ? <span className="idemo-good">✓</span> : <span className={`idemo-tag t-body-xs${r[3] === "Paid" ? " is-good" : ""}`}>{r[3]}</span>}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Portal({ t, rowsDone }: { t: number; rowsDone: number }) {
  const section = t >= 3950 ? "Billing" : "Home";
  return (
    <div className="idemo-portal idemo-appear">
      <nav className="idemo-portal__nav">
        <span className="idemo-portal__brand t-h6">Acme</span>
        {["Home", "Orders", "Billing", "Settings"].map((n) => (
          <span key={n} data-mark={n === "Billing" ? "billing" : undefined} className={`idemo-portal__link t-body-s${n === section ? " is-on" : ""}${n === "Billing" && t >= 3950 && t < 4110 ? " is-pressed" : ""}`}>{n}</span>
        ))}
      </nav>
      <div className="idemo-portal__main">{t >= 4100 ? <PortalInvoices t={t} rowsDone={rowsDone} /> : <PortalHome />}</div>
    </div>
  );
}

function ResultCard({ t }: { t: number }) {
  const lines = clamp(Math.floor((t - RESULT_AT - 250) / 90) + 1, 0, JSON_LINES.length);
  const done = t >= DONE;
  return (
    <div className="idemo-result">
      <div className="idemo-result__veil idemo-appear" />
      <div className={`idemo-result__card${done ? " is-done" : ""}`}>
        <div className="idemo-result__head">
          <span className="idemo-result__title t-label-m">
            {done ? <span className="idemo-result__tick"><Icon name="check" size={12} /></span> : <Icon name="fish" size={16} />}
            {done ? "Agent complete" : "Sending to your agent"}
          </span>
          <span className={`idemo-tag t-body-xs${done ? " is-good" : ""}`}>{done ? "Sent to your agent" : "JSON"}</span>
        </div>
        <pre className="idemo-result__json t-mono-s">
          {JSON_LINES.map(([plain, hi, hiPhone], i) => (
            <span key={i} className={`idemo-result__line${i < lines ? " is-in" : ""}`}>
              {plain}
              {hi && <span className="idemo-good"><span className={hiPhone ? "idemo-wide" : undefined}>{hi}</span>{hiPhone && <span className="idemo-narrow">{hiPhone}</span>}</span>}
            </span>
          ))}
        </pre>
        <div className="idemo-result__foot t-mono-s">
          {done ? <span className="idemo-appear">Done in {(DONE / 1000).toFixed(1)}s</span> : <span className="idemo-result__sending"><span className="idemo-result__dot" />Sending…</span>}
          <span className={done ? undefined : "idemo-muted"}>View recording ↗</span>
        </div>
      </div>
    </div>
  );
}

function Demo() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const t = useRunClock(inView);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLSpanElement>(null);
  const rowsDone = t < 5950 ? 0 : clamp(Math.floor((t - 5950) / 300) + 1, 0, UNPAID.length);
  usePointer(bodyRef, pointerRef, pointerTarget(t, rowsDone));
  const stepIndex = RUN_STEPS.findIndex((s) => t < s.end);
  const current = stepIndex === -1 ? RUN_STEPS.length : stepIndex;
  const finished = current >= RUN_STEPS.length;
  const step = RUN_STEPS[Math.min(current, RUN_STEPS.length - 1)];
  const signedIn = t >= 3000;
  const url = t < 2150 ? "portal.acme.com/login" : t < 3000 ? "portal.acme.com/verify" : t < 4100 ? "portal.acme.com/home" : t < 5750 ? "portal.acme.com/billing" : "portal.acme.com/billing?status=unpaid";
  const tapping = CLICKS.some((c) => t >= c && t < c + 450);
  return (
    <div ref={ref} className="idemo-frame">
      <div className="idemo-stage">
        <div className="idemo-stage__bg" aria-hidden>
          <VectorLoop src="/assets/interactive-demo/identity.tfv" width={3072} height={1875} />
        </div>
        <div className="idemo-window" aria-hidden>
          <div className="idemo-window__head">
            <div className="idemo-steps">
              {PHASES.map((p, i) => {
                const from = p.from === 0 ? 0 : RUN_STEPS[p.from - 1].end;
                const progress = clamp((t - from) / (RUN_STEPS[p.to - 1].end - from), 0, 1);
                const active = current >= p.from && current < p.to, reached = current >= p.from, complete = current >= p.to;
                return (
                  <span key={p.label} className={`idemo-step${active ? " is-active" : ""}`}>
                    <NumberBadge variant={reached ? "filled" : "neutral"} className={`idemo-step__badge${complete ? " is-complete" : ""}`}>
                      {complete ? <Icon name="check" size={12} /> : i + 1}
                    </NumberBadge>
                    <span className={`idemo-step__label t-label-m${reached ? "" : " idemo-muted"}`}>{p.label}</span>
                    <span className="idemo-step__bar"><span style={{ transform: `scaleX(${progress})` }} /></span>
                  </span>
                );
              })}
            </div>
            <div className="idemo-address">
              <p className="idemo-address__field t-mono-s">{url}</p>
              {signedIn && <span className="idemo-address__saved idemo-appear t-body-xs"><span className="idemo-result__dot is-good" />session saved to Profiles</span>}
            </div>
          </div>
          <div ref={bodyRef} className="idemo-window__body">
            {signedIn ? <Portal t={t} rowsDone={rowsDone} /> : <SignInCard t={t} />}
            {t >= RESULT_AT && <ResultCard t={t} />}
            {/* The agent's cursor, as on the Solutions portal card; usePointer places it */}
            <span ref={pointerRef} className={`idemo-pointer${tapping ? " is-tapping" : ""}`} style={{ opacity: 0 }} aria-hidden>
              <img className="idemo-pointer__cursor" src="/assets/solutions/cursor.svg" width={14} height={16} alt="" />
              <IconContainer size={32} tone="orange" depth="strong" className="idemo-pointer__agent"><Icon name="fish" size={15} /></IconContainer>
            </span>
          </div>
          <div className="idemo-status">
            <div className="idemo-status__lead">
              <span className={`idemo-status__icon${finished ? " is-done" : ""}`}>
                {finished ? <Icon name="check" size={12} /> : <><span className="idemo-status__spin" /><IconContainer size={24} depth="subtle">{STEP_ICONS[step.id]}</IconContainer></>}
              </span>
              <p key={finished ? "done" : step.id} className="idemo-appear t-label-m">{finished ? "Complete · 12 unpaid invoices" : step.label}</p>
            </div>
            <p className={`idemo-status__timing t-body-s${finished ? " idemo-good" : ""}`}>
              {finished ? `done in ${(DONE / 1000).toFixed(1)}s` : `${current + 1} of ${RUN_STEPS.length} · ${(Math.min(t, DONE) / 1000).toFixed(1)}s`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES: { icon: LocalIconName; title: string; body: string }[] = [
  { icon: "lock", title: "Vault", body: "Connect 1Password or Bitwarden. Each run gets only the logins you pick, and the model never sees them." },
  { icon: "person", title: "Profiles", body: "Save a signed-in session once. Later runs start logged in, and sign back in from Vault when it expires." },
  { icon: "refresh", title: "Replay", body: "Every run is recorded step by step, so you can see exactly what your agent did." },
];

export function InteractiveDemo() {
  return (
    <section className="idemo" id="identity">
      <header className="idemo-intro">
        <Eyebrow>IDENTITY</Eyebrow>
        <MobileSteppedHeading first="Access the web" second="behind the login" body="Your agent signs in with your own logins, does the work, and records every step." />
        <div className="idemo-pill">
          <div className="idemo-pill__head depth-inner-strong">
            <h2 className="t-h1"><span>Access the web</span>{" "}<span>behind the login</span></h2>
          </div>
          <div className="idemo-pill__tab-row">
            <img className="idemo-pill__cutout idemo-pill__cutout--left" src="/assets/interactive-demo/cutout-left.svg" width={16} height={16} alt="" />
            <div className="idemo-pill__tab depth-inner-strong depth-join">
              <p className="t-body-xl">Your agent signs in with your own logins, does the work, and records every step.</p>
            </div>
            <img className="idemo-pill__cutout" src="/assets/interactive-demo/cutout-right.svg" width={16} height={16} alt="" />
          </div>
        </div>
      </header>

      <div className="idemo-body">
        <Demo />
        <ul className="idemo-features">
          {FEATURES.map((f) => (
            <li key={f.title} className="idemo-feature">
              <IconContainer size={40} tone="orange" depth="default">
                <LocalIcon name={f.icon} size={20} />
              </IconContainer>
              <div className="idemo-feature__content">
                <h3 className="t-h6">{f.title}</h3>
                <p className="t-body-m">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
