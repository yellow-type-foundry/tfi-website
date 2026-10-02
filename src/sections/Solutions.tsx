import type { ReactNode } from "react";
import { DigitPop } from "../components/transitions/DigitPop";
import { SpinningCounter } from "../components/transitions/SpinningCounter";
import { useInView, useLoop } from "../hooks/useLoop";
import { BrowserWindow } from "../components/BrowserWindow";
import { Eyebrow } from "../components/Eyebrow";
import { Icon } from "../components/Icon";
import "./Solutions.css";

function FeatureCard({ title, description, descWidth, children }: { title: string; description: ReactNode; descWidth?: number; children: ReactNode }) {
  return (
    <article className="feature-card depth-strong">
      <div className="feature-card__content">
        <h3 className="t-h5">{title}</h3>
        <p className="t-body-m" style={descWidth ? { width: descWidth } : undefined}>{description}</p>
      </div>
      <div className="feature-card__preview">{children}</div>
    </article>
  );
}

const Divider = ({ src = "/assets/solutions/divider.svg", w = 344 }: { src?: string; w?: number }) => (
  <img className="sol-divider" src={src} width={w} height={1} alt="" />
);

/* The Monitor, Enrich and Research loops are built from transitions.dev recipes (see
   styles/transitions.css): useLoop flips their documented state classes on a timeline. When the
   loop isn't playing (off screen, reduced motion) each card renders its designed state. */

function MonitorPreview({ live }: { live: boolean }) {
  // 1.8s: the price changes (number pop-in) · 2.6s: the alert rises in (toast) · 6s: it closes.
  const { playing, phase } = useLoop(live, 7000, [1800, 2600]);
  const changed = !playing || phase >= 1;
  const alertOpen = !playing || (phase >= 2 && phase < 3);
  const plans = [
    { name: "Starter", price: "$19" },
    { name: "Starter", price: changed ? "$59" : "$49", active: true },
    { name: "Team", price: "$129" },
  ];
  return (
    <>
      <BrowserWindow
        className="sol-window sol-window--monitor"
        url="acme.com/pricing"
        gap={8}
        trailing={<span className="sol-badge t-label-xs">Monitoring</span>}
      >
        <div className="sol-panel depth-subtle">
          <div className="sol-plans">
            {plans.map((p, i) => (
              <div key={i} className={`sol-plan${p.active ? " sol-plan--active" : ""}${p.active && !changed ? " is-idle" : ""}`}>
                <p className="t-body-s">{p.name}</p>
                <div className="sol-plan__details">
                  <p className="t-h5">{p.active ? <DigitPop value={p.price} animate={playing} /> : p.price}</p>
                  <span className="sol-bar sol-bar--full" />
                  <span className="sol-bar sol-bar--short" />
                </div>
              </div>
            ))}
          </div>
          <div className="sol-skeleton">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="sol-skeleton__item">
                {i > 0 && <Divider />}
                <span className="sol-skel-bar" />
              </div>
            ))}
          </div>
        </div>
      </BrowserWindow>
      <div className="sol-toast-anchor">
        <div className="sol-toast-pos">
        <div className={`sol-toast t-toast${alertOpen ? " is-open" : ""}`} role="status">
          <p className="sol-toast__from t-body-xs">
            <Icon name="fish" size={16} className="sol-fish" />
            <span><strong>TinyFish ·</strong> now</span>
          </p>
          <div className="sol-toast__msg">
            <p className="t-label-m">Acme raised the Pro plan</p>
            <p className="t-body-xs"><s>$49</s> → $59 a month</p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

function EnrichPreview({ live }: { live: boolean }) {
  // Cells pulse as skeletons, then reveal one by one (skeleton loader and reveal) while the
  // counter pops (number pop-in); at 6.6s they snap back to loading for the next loop.
  const { playing, phase } = useLoop(live, 7200, [1500, 2700, 3900]);
  const resetting = playing && phase === 4;
  const revealed = (i: number) => playing && phase > i && phase < 4;
  const count = playing ? 2 + Math.min(phase, 3) * (phase < 4 ? 1 : 0) : 2;
  const fade = (w: number, h = 8, to = "subtle") => <span className={`sol-fade sol-fade--${to}`} style={{ width: w, height: h }} />;
  const cell = (w: number, value: string, i: number) => (
    <span className={`sol-cell t-skel${revealed(i) ? " is-revealed" : ""}${resetting ? " is-resetting" : ""}`} style={{ width: Math.max(w, 56) }}>
      <span className={`t-skel-skeleton${playing && !revealed(i) ? " is-pulsing" : ""}`}>{fade(w)}</span>
      <span className="t-skel-content" aria-hidden={!revealed(i)}>{value}</span>
    </span>
  );
  const status = "Checking northwind.com, kestrel.com";
  return (
    <BrowserWindow className="sol-window sol-window--enrich" url="crm.yourco.com/leads">
      <div className="sol-panel sol-table depth-default">
        <div>
          <div className="sol-table__head t-label-s">
            <span className="c1">Company</span><span className="c2">Headcount</span><span className="c3">HQ</span>
          </div>
          <img className="sol-table__rule" src="/assets/solutions/divider-table.svg" alt="" />
          {[0, 1].map((i) => (
            <div key={i} className="sol-table__row t-body-s">
              <span className="c1 primary">Globex</span><span className="c2">1,240</span><span className="c3">Denver</span>
            </div>
          ))}
          <img className="sol-table__rule" src="/assets/solutions/divider-table.svg" alt="" />
          <div className="sol-table__row sol-table__row--active t-label-m">
            <span className="c1">Northwind</span><span className="c2">86</span><span className="c3">{cell(64, "Austin", 0)}</span>
          </div>
          <div className="sol-table__row sol-table__row--active t-label-m">
            <span className="c1">Kestrel</span><span className="c2">{cell(48, "212", 1)}</span><span className="c3">{cell(64, "Leeds", 2)}</span>
          </div>
          <div className="sol-table__row t-body-s">
            <span className="c1 primary">Umbrella</span><span className="c2">{fade(36, 6, "white")}</span><span className="c3">{fade(44, 6, "white")}</span>
          </div>
          <img className="sol-table__end" src="/assets/solutions/divider-table-end.svg" width={384} height={1} alt="" />
        </div>
        <div className="sol-status">
          <div className="sol-status__lead">
            <span className="sol-status__icon depth-subtle"><Icon name="globe" size={12} /></span>
            <p className="t-label-s">
              {/* Shimmer text while the agent works (pure CSS); plain text when static. */}
              <span className={playing ? "t-shimmer sol-shimmer" : undefined} data-text={status}>{status}</span>
            </p>
          </div>
          <p className="t-body-s sol-status__count"><DigitPop value={String(count)} animate={playing} /> of 5</p>
        </div>
      </div>
    </BrowserWindow>
  );
}

function ResearchPreview({ live }: { live: boolean }) {
  // 0s: the question types out · 1.9s: "read 214 pages" (spinning counter) · 3.6s: answer and
  // sources rise in (texts reveal) · 7.2s: they fade out before the next loop.
  const { playing, phase, cycle } = useLoop(live, 8000, [1900, 3600]);
  const byShown = !playing || (phase >= 1 && phase < 3);
  const answerShown = !playing || phase === 2;
  const answerHiding = playing && phase === 3;
  const stagger = (shown: boolean, hiding = false) => `t-stagger${shown ? " is-shown" : ""}${hiding ? " is-hiding" : ""}`;
  return (
    <BrowserWindow className="sol-window sol-window--research">
      <div className="sol-panel sol-research depth-default">
        <div className="sol-research__field">
          <Icon name="search" size={12} className="sol-research__search" />
          <p key={cycle} className={`t-body-s sol-typed${playing ? " sol-typed--query" : ""}`}>Which suppliers changed owner this year?</p>
        </div>
        <div className="sol-research__answer">
          <div className={stagger(byShown, playing && phase === 3)}>
            <p className="sol-research__by t-body-s t-stagger-line t-stagger-line--1">
              <Icon name="fish" size={16} className="sol-fish" />
              <span><strong>TinyFish</strong> read <SpinningCounter value={214} spinKey={cycle} spin={playing && phase >= 1} /> pages</span>
            </p>
          </div>
          <p className={`t-h6 sol-research__headline ${stagger(answerShown, answerHiding)}`}>
            <span className="t-stagger-line t-stagger-line--1">Two changed owner:</span>
            <span className="t-stagger-line t-stagger-line--2">Northwind and Kestrel.</span>
          </p>
        </div>
        <ul className={`sol-research__sources t-body-s ${stagger(answerShown, answerHiding)}`}>
          {["companieshouse.gov.uk", "sec.gov", "bloomberg.com"].map((src, i) => (
            <li key={src} className={`t-stagger-line t-stagger-line--${i + 3}`}>{src}</li>
          ))}
        </ul>
      </div>
    </BrowserWindow>
  );
}

function PortalPreview() {
  const Field = ({ label, value, typed }: { label: string; value?: string; typed?: { text: string; step: number } }) => (
    <label className="sol-field">
      <span className="t-label-s">{label}</span>
      <span className="sol-field__input depth-subtle t-body-m">
        {value}
        {typed && <span className={`sol-typed sol-typed--field${typed.step}`} aria-hidden>{typed.text}</span>}
      </span>
    </label>
  );
  return (
    <BrowserWindow className="sol-window sol-window--portal" url="crm.yourco.com/leads">
      <div className="sol-panel sol-portal depth-default">
        <div className="sol-portal__head">
          <p className="t-label-xl">Supplier onboarding</p>
          <p className="t-mono-s sol-portal__step"><span>Step 3</span> of 10</p>
        </div>
        <div className="sol-portal__row">
          <Field label="Legal name" value="Yourco Inc." />
          <Field label="Tax ID" value="84-2917305" />
        </div>
        <div className="sol-portal__stack">
          <Field label="Contact email" typed={{ text: "ap@yourco.com", step: 1 }} />
          <Field label="Street address" typed={{ text: "500 Howard St, San Francisco", step: 2 }} />
          <span className="sol-portal__pointer" aria-hidden>
            <img className="sol-portal__cursor" src="/assets/solutions/cursor.svg" width={14} height={16} alt="" />
            <span className="sol-portal__agent depth-strong"><Icon name="fish" size={12} /></span>
          </span>
        </div>
        <span className="btn btn--secondary btn--xs sol-portal__next"><span className="btn__label">Next</span></span>
      </div>
    </BrowserWindow>
  );
}

export function Solutions() {
  const [ref, live] = useInView<HTMLElement>();
  return (
    <section ref={ref} className={`solutions${live ? " is-live" : ""}`} id="solutions">
      <div className="solutions__bg" aria-hidden>
        <img src="/assets/solutions/bg.png" alt="" />
      </div>
      <header className="solutions__header">
        <Eyebrow>SOLUTIONS</Eyebrow>
        <h2 className="t-h2">What TinyFish can do</h2>
        <p className="t-body-xl">Four jobs people hand their agents every day, on the live web.</p>
      </header>
      <div className="solutions__grid">
        <FeatureCard title="Monitor web pages" description={<>Get an alert when a page or topic changes.<br />Prices, filings, job posts.</>}>
          <MonitorPreview live={live} />
        </FeatureCard>
        <FeatureCard title="Enrich records" description="Check contacts and accounts against the live web and fill the gaps." descWidth={324}>
          <EnrichPreview live={live} />
        </FeatureCard>
        <FeatureCard title="Research anything" description="Ask a question, get an answer that links to every source it used." descWidth={309}>
          <ResearchPreview live={live} />
        </FeatureCard>
        <FeatureCard title="Automate portals" description="Sign in, fill forms and pull files from other companies' portals." descWidth={250}>
          <PortalPreview />
        </FeatureCard>
      </div>
    </section>
  );
}
