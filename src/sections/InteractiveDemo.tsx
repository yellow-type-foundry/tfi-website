import type { ReactElement } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useLoop";
import { Eyebrow } from "../components/Eyebrow";
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

/* Illustration of an agent run (the Figma "Interactive Demo" frame): step 1 of 3, signing in.
   Nothing here is interactive; the window is a picture of the product, hidden from assistive tech
   and described by the section heading instead. */
const STEPS = ["Log in", "Navigate", "Complete"];
const EMAIL = "johnapple@acme.com";
const PASSWORD_LENGTH = 10;

/**
 * The sign-in plays on a quiet loop while on screen: the email types out, the caret moves on and the
 * password fills, Continue turns active and is pressed, then it holds and clears. Off screen or with
 * reduced motion it shows the designed still (email part-typed, caret blinking).
 */
function useSignIn(inView: boolean) {
  const playing = inView && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [typed, setTyped] = useState(0); // characters of email, then password
  const [stage, setStage] = useState<"typing" | "ready" | "pressed" | "clearing">("typing");
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (!playing) return;
    setTyped(0);
    setStage("typing");
    const timers: number[] = [];
    const at = (t: number, fn: () => void) => timers.push(window.setTimeout(fn, t));
    let t = 500;
    for (let i = 1; i <= EMAIL.length; i++) at((t += 55), () => setTyped(i));
    t += 350; // the agent moves to the password field
    for (let i = 1; i <= PASSWORD_LENGTH; i++) at((t += 60), () => setTyped(EMAIL.length + i));
    at((t += 300), () => setStage("ready"));
    at((t += 450), () => setStage("pressed"));
    at((t += 180), () => setStage("ready"));
    at((t += 1800), () => setStage("clearing"));
    at((t += 300), () => setCycle((c) => c + 1));
    return () => timers.forEach(clearTimeout);
  }, [playing, cycle]);
  if (!playing) return { email: "johnapple", password: 0, caret: "email" as const, stage: "typing" as const, pointer: "email" as const };
  const email = EMAIL.slice(0, Math.min(typed, EMAIL.length));
  const password = Math.max(0, typed - EMAIL.length);
  const caret = stage !== "typing" ? null : typed < EMAIL.length ? ("email" as const) : ("password" as const);
  // The agent's cursor gets to each field just before it types there, then onto Continue
  const pointer =
    stage === "clearing" ? ("rest" as const)
    : typed < EMAIL.length ? ("email" as const)
    : typed < EMAIL.length + PASSWORD_LENGTH ? ("password" as const)
    : ("submit" as const);
  return { email, password, caret, stage, pointer };
}

type PointerTarget = "email" | "password" | "submit" | "rest";

/** Places the agent cursor (the Solutions portal pointer) over its target inside the sign-in card,
    measured from the real fields; CSS transitions the move. */
function usePointer(cardRef: React.RefObject<HTMLDivElement | null>, pointerRef: React.RefObject<HTMLSpanElement | null>, target: PointerTarget) {
  useLayoutEffect(() => {
    const card = cardRef.current;
    const pointer = pointerRef.current;
    if (!card || !pointer) return;
    const place = () => {
      const box = card.getBoundingClientRect();
      const el =
        target === "email" ? card.querySelectorAll(".idemo-input__field")[0]
        : target === "password" ? card.querySelectorAll(".idemo-input__field")[1]
        : card.querySelector(".idemo-card__submit");
      const r = (el ?? card).getBoundingClientRect();
      const x = target === "rest" ? box.width - 56 : r.left - box.left + r.width * (target === "submit" ? 0.62 : 0.55);
      const y = target === "rest" ? box.height - 24 : r.top - box.top + r.height * 0.62;
      pointer.style.transform = `translate(${x}px, ${y}px)`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(card);
    return () => observer.disconnect();
  }, [cardRef, pointerRef, target]);
}

function Demo() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const { email, password, caret, stage, pointer } = useSignIn(inView);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLSpanElement>(null);
  usePointer(cardRef, pointerRef, pointer);
  return (
    <div ref={ref} className="idemo-frame">
      <div className="idemo-stage">
        <div className="idemo-stage__bg" aria-hidden>
          <VectorLoop src="/assets/interactive-demo/identity.tfv" width={3072} height={1875} />
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
            <div ref={cardRef} className={`idemo-card depth-default${stage === "clearing" ? " is-clearing" : ""}`}>
              <p className="idemo-card__title t-h5">Sign In</p>
              <div className="idemo-input">
                <span className="t-label-m">Email</span>
                <span className="idemo-input__field depth-subtle">
                  <span className="idemo-input__value t-body-m">{email}{caret === "email" && <span className="idemo-input__caret" />}</span>
                </span>
              </div>
              <div className="idemo-input">
                <span className="t-label-m">Password</span>
                <span className="idemo-input__field depth-subtle">
                  <span className="idemo-input__value t-body-m">{"•".repeat(password)}{caret === "password" && <span className="idemo-input__caret" />}</span>
                </span>
              </div>
              {/* The agent's cursor, as on the Solutions portal card */}
              <span ref={pointerRef} className={`idemo-pointer${pointer === "rest" ? " is-resting" : ""}${stage === "pressed" ? " is-tapping" : ""}`} aria-hidden>
                <img className="idemo-pointer__cursor" src="/assets/solutions/cursor.svg" width={14} height={16} alt="" />
                <span className="idemo-pointer__agent depth-strong"><Icon name="fish" size={15} /></span>
              </span>
              <span className={`btn btn--l btn--secondary idemo-card__submit${stage === "ready" || stage === "pressed" ? " is-ready" : ""}${stage === "pressed" ? " is-pressed" : ""}`}>
                <span className="btn__label">Continue</span>
              </span>
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
