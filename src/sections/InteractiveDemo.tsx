import type { ReactElement } from "react";
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

/* Static illustration of an agent run (the Figma "Interactive Demo" frame): step 1 of 3, signing in.
   Nothing here is interactive; the window is a picture of the product, hidden from assistive tech
   and described by the section heading instead. */
const STEPS = ["Log in", "Navigate", "Complete"];

function Demo() {
  return (
    <div className="idemo-frame depth-strong">
      <div className="idemo-stage">
        <div className="idemo-stage__bg" aria-hidden>
          <img src="/assets/interactive-demo/shader-bg.png" alt="" />
        </div>
        <div className="idemo-window" aria-hidden>
          <div className="idemo-window__head">
            <div className="idemo-steps">
              {STEPS.map((label, i) => (
                <span key={label} className={`idemo-step${i === 0 ? " is-active" : ""}`}>
                  <span className="idemo-step__badge t-label-m">{i + 1}</span>
                  <span className="idemo-step__label t-label-m">{label}</span>
                </span>
              ))}
            </div>
            <div className="idemo-address">
              <p className="idemo-address__field t-mono-s">portal.acme.com/login</p>
            </div>
          </div>
          <div className="idemo-window__body">
            <div className="idemo-card depth-default">
              <p className="idemo-card__title t-h5">Sign In</p>
              <div className="idemo-input">
                <span className="t-label-m">Email</span>
                <span className="idemo-input__field depth-subtle">
                  <span className="idemo-input__value t-body-m">johnapple<span className="idemo-input__caret" /></span>
                </span>
              </div>
              <div className="idemo-input">
                <span className="t-label-m">Password</span>
                <span className="idemo-input__field depth-subtle"><span className="idemo-input__value t-body-m" /></span>
              </div>
              <span className="btn btn--l btn--secondary idemo-card__submit"><span className="btn__label">Continue</span></span>
            </div>
          </div>
          <div className="idemo-status">
            <div className="idemo-status__lead">
              <span className="idemo-status__icon depth-subtle"><Icon name="globe" size={12} /></span>
              <p className="t-label-m">Open the portal</p>
            </div>
            <p className="idemo-status__timing t-body-s">1 of 7 · 0.2s</p>
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
