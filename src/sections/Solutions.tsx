import type { ReactNode } from "react";
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

function MonitorPreview() {
  const plans = [
    { name: "Starter", price: "$19" },
    { name: "Starter", price: "$59", active: true },
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
              <div key={i} className={`sol-plan${p.active ? " sol-plan--active" : ""}`}>
                <p className="t-body-s">{p.name}</p>
                <div className="sol-plan__details">
                  <p className="t-h5">{p.price}</p>
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
      <div className="sol-toast">
        <p className="sol-toast__from t-body-xs">
          <Icon name="fish" size={16} className="sol-fish" />
          <span><strong>TinyFish ·</strong> now</span>
        </p>
        <div className="sol-toast__msg">
          <p className="t-label-m">Acme raised the Pro plan</p>
          <p className="t-body-xs"><s>$49</s> → $59 a month</p>
        </div>
      </div>
    </>
  );
}

function EnrichPreview() {
  const fade = (w: number, h = 8, to = "subtle") => <span className={`sol-fade sol-fade--${to}`} style={{ width: w, height: h }} />;
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
            <span className="c1">Northwind</span><span className="c2">86</span><span className="c3">{fade(64)}</span>
          </div>
          <div className="sol-table__row sol-table__row--active t-label-m">
            <span className="c1">Kestrel</span><span className="c2">{fade(48)}</span><span className="c3">{fade(64)}</span>
          </div>
          <div className="sol-table__row t-body-s">
            <span className="c1 primary">Umbrella</span><span className="c2">{fade(36, 6, "white")}</span><span className="c3">{fade(44, 6, "white")}</span>
          </div>
          <img className="sol-table__end" src="/assets/solutions/divider-table-end.svg" width={384} height={1} alt="" />
        </div>
        <div className="sol-status">
          <div className="sol-status__lead">
            <span className="sol-status__icon depth-subtle"><Icon name="globe" size={12} /></span>
            <p className="t-label-s">Checking northwind.com, kestrel.com</p>
          </div>
          <p className="t-body-s sol-status__count">2 of 5</p>
        </div>
      </div>
    </BrowserWindow>
  );
}

function ResearchPreview() {
  return (
    <BrowserWindow className="sol-window sol-window--research">
      <div className="sol-panel sol-research depth-default">
        <div className="sol-research__field">
          <Icon name="search" size={12} className="sol-research__search" />
          <p className="t-body-s">Which suppliers changed owner this year?</p>
        </div>
        <div className="sol-research__answer">
          <p className="sol-research__by t-body-s">
            <Icon name="fish" size={16} className="sol-fish" />
            <span><strong>TinyFish</strong> read 214 pages</span>
          </p>
          <p className="t-h6">Two changed owner:<br />Northwind and Kestrel.</p>
        </div>
        <ul className="sol-research__sources t-body-s">
          <li>companieshouse.gov.uk</li>
          <li>sec.gov</li>
          <li>bloomberg.com</li>
        </ul>
      </div>
    </BrowserWindow>
  );
}

function PortalPreview() {
  const Field = ({ label, value }: { label: string; value?: string }) => (
    <label className="sol-field">
      <span className="t-label-s">{label}</span>
      <span className="sol-field__input depth-subtle t-body-m">{value}</span>
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
          <Field label="Contact email" />
          <Field label="Street address" />
          <img className="sol-portal__cursor" src="/assets/solutions/cursor.svg" width={14} height={16} alt="" />
          <span className="sol-portal__agent depth-strong"><Icon name="fish" size={12} /></span>
        </div>
        <span className="btn btn--secondary btn--xs sol-portal__next"><span className="btn__label">Next</span></span>
      </div>
    </BrowserWindow>
  );
}

export function Solutions() {
  return (
    <section className="solutions" id="solutions">
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
          <MonitorPreview />
        </FeatureCard>
        <FeatureCard title="Enrich records" description="Check contacts and accounts against the live web and fill the gaps." descWidth={324}>
          <EnrichPreview />
        </FeatureCard>
        <FeatureCard title="Research anything" description="Ask a question, get an answer that links to every source it used." descWidth={309}>
          <ResearchPreview />
        </FeatureCard>
        <FeatureCard title="Automate portals" description="Sign in, fill forms and pull files from other companies' portals." descWidth={250}>
          <PortalPreview />
        </FeatureCard>
      </div>
    </section>
  );
}
