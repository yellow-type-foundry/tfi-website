import type { CSSProperties, ReactElement, ReactNode } from "react";
import { BrowserWindow } from "../components/BrowserWindow";
import { Icon } from "../components/Icon";
import "./ProductShowcase.css";

/* Local stand-ins for the SF Symbols used in the agent step lists (link, shield.fill, lock.fill, macwindow). */
type StepIconName = "fish" | "link" | "shield" | "lock" | "window";

const stepIconPaths: Record<Exclude<StepIconName, "fish">, ReactElement> = {
  link: (
    <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4l-1.4 1.4" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.4-1.4" />
    </g>
  ),
  shield: <path d="M12 2.5 4 5.6v6c0 4.9 3.3 8.6 8 9.9 4.7-1.3 8-5 8-9.9v-6L12 2.5Z" />,
  lock: (
    <>
      <path fill="none" stroke="currentColor" strokeWidth="2.6" d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <rect x="5" y="10" width="14" height="11" rx="2.5" />
    </>
  ),
  window: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4">
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <path d="M3 9h18" />
    </g>
  ),
};

function StepIcon({ name, accent }: { name: StepIconName; accent?: boolean }) {
  const cls = `ps-step__icon${accent ? " ps-step__icon--accent" : ""}`;
  return (
    <span className={cls} aria-hidden>
      {name === "fish" ? (
        <Icon name="fish" size={12} />
      ) : (
        <svg width={11} height={11} viewBox="0 0 24 24" fill="currentColor">
          {stepIconPaths[name]}
        </svg>
      )}
    </span>
  );
}

type Step = { icon: StepIconName; accent?: boolean; label: ReactNode; detail?: string };

const quoteSteps: Step[] = [
  { icon: "fish", accent: true, label: <><strong>Agent</strong> · kestrel.com/quote</> },
  { icon: "link", label: "Opened quote form", detail: "kestrel.com" },
  { icon: "shield", label: "Filled business details", detail: "5 employees · CA" },
  { icon: "lock", label: "Selected general liability", detail: "$1M limit" },
  { icon: "lock", label: "Submitted for underwriting", detail: "waited 8.2s" },
  { icon: "window", accent: true, label: "Extracted quote", detail: "$1,284 / yr" },
];

const quotePrompt = (
  <>
    Get a liability quote from <span className="ps-link">kestrel.com/quote</span>.<br />
    Consulting firm, five employees, California.
  </>
);
const quoteAnswer = "$1,284 a year with Kestrel. $1M limit, $500 deductible. Nobody wrote a script.";

const rateLimitTable = [
  "Limits apply per API key, per minute.",
  "| Tier       | Requests/min | Burst  |",
  "| ---------- | ------------ | ------ |",
  "| Pro        | 600          | 1,000  |",
  "| Enterprise | 6,000        | 10,000 |",
].join("\n");

function StepRow({ icon, accent, label, detail }: Step) {
  return (
    <li className="ps-step">
      <div className="ps-step__lead">
        <StepIcon name={icon} accent={accent} />
        <p className="ps-step__label t-body-s">{label}</p>
      </div>
      {detail && <p className="ps-step__detail t-mono-s">{detail}</p>}
    </li>
  );
}

/** Chat transcript inside the mock browser: user prompt, the agent's steps, and the final answer. */
function AgentChat({ prompt, steps, answer }: { prompt: ReactNode; steps: ReactNode; answer: string }) {
  return (
    <div className="ps-chat">
      <div className="ps-chat__prompt">
        <p className="ps-msg t-body-s">{prompt}</p>
      </div>
      <div className="ps-chat__agent">
        <p className="ps-chat__caption t-body-s">Your agent</p>
        <div className="ps-steps depth-default">{steps}</div>
      </div>
      <div className="ps-chat__answer">
        <p className="t-h6">{answer}</p>
      </div>
    </div>
  );
}

type ProductCardProps = {
  id: string;
  title: string;
  description: ReactNode;
  cta: string;
  /** "search" = the tall yellow first card; "landscape" = the green landscape cards. */
  tone: "search" | "landscape";
  /** Shader image box, relative to the card (Figma frame offsets). */
  bg: { left: number; top: number; width: number; height: number; position?: string };
  largeDots?: boolean;
  children: ReactNode;
};

const FIGMA_CARD_WIDTH = 1376;

function ProductCard({ id, title, description, cta, tone, bg, largeDots = true, children }: ProductCardProps) {
  // Offsets are from the 1376px-wide Figma card; the width keeps the same overhang as the card grows.
  const bgStyle: CSSProperties = { left: bg.left, top: bg.top, width: `calc(100% + ${bg.width - FIGMA_CARD_WIDTH}px)`, height: bg.height, objectPosition: bg.position };
  return (
    <article className="ps-panel depth-strong" id={id} aria-labelledby={`${id}-title`}>
      <div className={`ps-card ps-card--${tone}`}>
        <img
          className="ps-card__bg"
          src={`/assets/product-showcase/shader-${tone}.png`}
          width={bg.width}
          height={bg.height}
          style={bgStyle}
          alt=""
          loading="lazy"
        />
        <div className="ps-card__layout">
          <div className="ps-intro">
            <div className="ps-intro__copy">
              <h2 className="t-h2" id={`${id}-title`}>{title}</h2>
              <p className="ps-intro__desc">{description}</p>
            </div>
            <a className="ps-cta" href="#">{cta}</a>
          </div>
          <BrowserWindow className={`ps-window${largeDots ? " ps-window--dots-lg" : ""}`}>{children}</BrowserWindow>
        </div>
      </div>
    </article>
  );
}

export function ProductShowcase() {
  const quoteList = (
    <ol className="ps-steps__list">
      {quoteSteps.map((s, i) => <StepRow key={i} {...s} />)}
    </ol>
  );

  return (
    <section className="product-showcase" id="products" aria-label="TinyFish APIs">
      <ProductCard
        id="search-api"
        title="Search API"
        description="Fresh results from the live web. Never cached. Real browser-rendered search that returns structured JSON."
        cta="Try Search for Free"
        tone="search"
        bg={{ left: -165, top: 92, width: 1541, height: 703, position: "center bottom" }}
      >
        <AgentChat prompt={quotePrompt} steps={quoteList} answer={quoteAnswer} />
      </ProductCard>

      <ProductCard
        id="fetch-api"
        title="Fetch API"
        description={<>From rendered page to clean data in one call.<br />Markdown, JSON or HTML, token-efficient.</>}
        cta="Try Fetch for Free"
        tone="landscape"
        bg={{ left: -83, top: 86, width: 1573, height: 674 }}
        largeDots={false}
      >
        <AgentChat
          prompt={<>Read <span className="ps-link">docs.acme.com/api/rate-limits</span> and tell me the enterprise limit.</>}
          steps={
            <ol className="ps-steps__list">
              <StepRow icon="fish" accent label={<><strong>Fetch</strong> · docs.acme.com/api/rate-limits</>} />
              <li className="ps-step ps-step--block">
                <span className="ps-badge t-label-xs">Rate Limit</span>
                <pre className="ps-markdown t-mono-s">{rateLimitTable}</pre>
              </li>
            </ol>
          }
          answer="6,000 requests a minute on enterprise, bursting to 10,000."
        />
      </ProductCard>

      <ProductCard
        id="browser-api"
        title="Browser API"
        description="Access the web that search can't reach. A real cloud browser you drive with Playwright, Puppeteer or CDP, with persistent state."
        cta="Try Search for Free"
        tone="landscape"
        bg={{ left: -83, top: 52, width: 1573, height: 674 }}
      >
        <AgentChat prompt={quotePrompt} steps={quoteList} answer={quoteAnswer} />
      </ProductCard>

      <ProductCard
        id="search-api-2"
        title="Search API"
        description="Fresh results from the live web. Never cached. Real browser-rendered search that returns structured JSON."
        cta="Try Search for Free"
        tone="landscape"
        bg={{ left: -83, top: -19, width: 1573, height: 674 }}
      >
        <AgentChat prompt={quotePrompt} steps={quoteList} answer={quoteAnswer} />
      </ProductCard>
    </section>
  );
}
