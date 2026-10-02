import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactElement } from "react";
import { Eyebrow } from "../components/Eyebrow";
import { Icon } from "../components/Icon";
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

type Step = { label: string; url: string; status: string; timing: string };
const STEPS: Step[] = [
  { label: "Log in", url: "portal.acme.com/login", status: "Open the portal", timing: "1 of 7 · 0.2s" },
  { label: "Navigate", url: "portal.acme.com/billing/invoices", status: "Find this month's invoices", timing: "4 of 7 · 1.6s" },
  { label: "Complete", url: "portal.acme.com/billing/invoices/export", status: "Download and record the run", timing: "7 of 7 · 3.1s" },
];

function SignInCard({ onContinue }: { onContinue: () => void }) {
  const [email, setEmail] = useState("johnapple");
  const [password, setPassword] = useState("");
  const ready = email.trim() !== "" && password !== "";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (ready) onContinue();
  };
  return (
    <form className="idemo-card depth-default" onSubmit={submit}>
      <h3 className="idemo-card__title t-h5">Sign In</h3>
      <label className="idemo-input">
        <span className="t-label-m">Email</span>
        <span className="idemo-input__field depth-subtle">
          <input className="t-body-m" type="text" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
          {/* Decorative typing caret shown while the field is not focused */}
          <span className="idemo-input__mirror t-body-m" aria-hidden>{email}<span className="idemo-input__caret" /></span>
        </span>
      </label>
      <label className="idemo-input">
        <span className="t-label-m">Password</span>
        <span className="idemo-input__field depth-subtle">
          <input className="t-body-m" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
        </span>
      </label>
      <button type="submit" className={`btn btn--l ${ready ? "btn--black" : "btn--secondary"} idemo-card__submit`} aria-disabled={!ready}>
        <span className="btn__label">Continue</span>
      </button>
    </form>
  );
}

function NavigateCard() {
  const rows = [
    { name: "INV-2041", date: "Sep 30", amount: "$4,120.00" },
    { name: "INV-2038", date: "Sep 16", amount: "$1,860.00" },
    { name: "INV-2032", date: "Sep 02", amount: "$2,415.50" },
  ];
  return (
    <div className="idemo-card idemo-card--wide depth-default">
      <h3 className="idemo-card__title t-h5">Invoices</h3>
      <ul className="idemo-rows">
        {rows.map((r, i) => (
          <li key={r.name} className={`idemo-row depth-subtle${i === 0 ? " idemo-row--active" : ""}`}>
            <span className="t-label-m">{r.name}</span>
            <span className="t-body-s idemo-row__muted">{r.date}</span>
            <span className="t-label-m">{r.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompleteCard({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="idemo-card idemo-card--center depth-default">
      <span className="idemo-done" aria-hidden><Icon name="check" size={20} /></span>
      <h3 className="idemo-card__title t-h5">Done</h3>
      <p className="t-body-m idemo-card__body">3 invoices downloaded. Every step is saved to the run log.</p>
      <button type="button" className="btn btn--l btn--secondary idemo-card__submit idemo-card__submit--active" onClick={onRestart}>
        <span className="btn__label">Replay run</span>
      </button>
    </div>
  );
}

function Demo() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = STEPS[active];

  const select = (i: number, focus = false) => {
    setActive(i);
    if (focus) tabRefs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = STEPS.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  };

  return (
    <div className="idemo-frame depth-strong">
      <div className="idemo-stage">
        <div className="idemo-stage__bg" aria-hidden>
          <img src="/assets/interactive-demo/shader-bg.png" alt="" />
        </div>
        <div className="idemo-window">
          <div className="idemo-window__head">
            <div className="idemo-steps" role="tablist" aria-label="Agent run steps" onKeyDown={onKey}>
              {STEPS.map((s, i) => (
                <button
                  key={s.label}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  type="button"
                  role="tab"
                  id={`idemo-tab-${i}`}
                  aria-selected={i === active}
                  aria-controls="idemo-panel"
                  tabIndex={i === active ? 0 : -1}
                  className={`idemo-step${i === active ? " is-active" : ""}`}
                  onClick={() => select(i)}
                >
                  <span className="idemo-step__badge t-label-m">{i + 1}</span>
                  <span className="idemo-step__label t-label-m">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="idemo-address">
              <p className="idemo-address__field t-mono-s">{step.url}</p>
            </div>
          </div>
          {/* Steps slide side by side (transitions.dev "page side-by-side"): earlier steps exit left, later ones right. */}
          <div className="idemo-window__body t-page-slide" data-page={active + 1} role="tabpanel" id="idemo-panel" aria-labelledby={`idemo-tab-${active}`}>
            {[
              <SignInCard key="login" onContinue={() => select(1)} />,
              <NavigateCard key="navigate" />,
              <CompleteCard key="complete" onRestart={() => select(0, true)} />,
            ].map((card, i) => (
              <section
                key={i}
                className="idemo-page t-page"
                data-page-id={i + 1}
                data-pos={i < active ? "before" : i > active ? "after" : "current"}
                inert={i !== active}
              >
                {card}
              </section>
            ))}
          </div>
          <div className="idemo-status" aria-live="polite">
            <div className="idemo-status__lead">
              <span className="idemo-status__icon depth-subtle"><Icon name="globe" size={12} /></span>
              <p className="t-label-m">{step.status}</p>
            </div>
            <p className="idemo-status__timing t-body-s">{step.timing}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES: { icon: LocalIconName; title: string; body: string; large?: boolean }[] = [
  { icon: "lock", title: "Vault", body: "Connect 1Password or Bitwarden. Each run gets only the logins you pick, and the model never sees them.", large: true },
  { icon: "person", title: "Profiles", body: "Save a signed-in session once. Later runs start logged in, and sign back in from Vault when it expires." },
  { icon: "refresh", title: "Replay", body: "Every run is recorded step by step, so you can see exactly what your agent did." },
];

export function InteractiveDemo() {
  return (
    <section className="idemo" id="identity">
      <header className="idemo-intro">
        <Eyebrow>IDENTITY</Eyebrow>
        <div className="idemo-pill">
          <div className="idemo-pill__head depth-inner-strong">
            <h2 className="t-h1">Access the web behind the login</h2>
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
              <span className={`idemo-feature__icon depth-default${f.large ? " idemo-feature__icon--l" : ""}`}>
                <LocalIcon name={f.icon} size={f.large ? 18 : 14} />
              </span>
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
