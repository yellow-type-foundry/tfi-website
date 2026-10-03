import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { BrowserWindow } from "../components/BrowserWindow";
import { VectorLoop } from "../components/VectorLoop";
import { Icon } from "../components/Icon";
import "./ProductShowcase.css";

/* Local stand-ins for the SF Symbols used in the agent step lists (link, shield.fill, lock.fill, macwindow, ellipsis). */
type StepIconName = "fish" | "link" | "shield" | "lock" | "window" | "ellipsis";

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
  ellipsis: (
    <>
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
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

const searchPrompt = (
  <>Find current pricing for the <span className="ps-link">Aurora 14</span> across our retail partners.</>
);
const searchResults = [
  { source: "northgate.com • updated 2 days ago", title: "Aurora 14 Laptop", text: "In stock. $1,299.00. Free shipping on orders over $50." },
  { source: "baymarket.com • updated today", title: "Aurora 14 Laptop (2026)", text: "$1,199.00 after instant rebate. Limited stock." },
  { source: "havenshop.com • · updated 5 days ago", title: "Aurora 14 Laptop", text: "$1,299.00. Ships in 2 to 3 business days." },
];
const searchAnswer = <>Baymarket dropped to $1,199 today.<br />The other two are holding at $1,299.</>;

const browserSteps: Step[] = [
  { icon: "fish", accent: true, label: <><strong>Browser</strong> · secure.carrier-portal.com</>, detail: "session live" },
  { icon: "link", label: <><strong>Connected over CDP</strong> · Playwright</>, detail: "142ms" },
  { icon: "shield", label: "Cloudflare Turnstile passed", detail: "380ms" },
  { icon: "lock", label: "Signed in", detail: "session 4f21" },
  { icon: "window", accent: true, label: "Quotes page reached", detail: "3 rows" },
];

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

function ResultRow({ source, title, text }: { source: string; title: string; text: string }) {
  return (
    <li className="ps-step ps-result">
      <img className="ps-result__thread" src="/assets/product-showcase/result-thread.svg" width={20} height={52} alt="" />
      <div className="ps-result__body">
        <p className="t-body-xs ps-result__source">{source}</p>
        <p className="t-label-s">{title}</p>
        <p className="t-body-xs ps-result__text">{text}</p>
      </div>
    </li>
  );
}

type ChatContent = { prompt: ReactNode; steps: ReactNode; answer: ReactNode; compact?: boolean };

/** A box that stays mounted while its contents change: it reshapes (width and height) from its current
    size to fit the new contents, which fade in. The contents are laid out at the final width straight
    away, so text never re-wraps mid-morph. `id` names the contents, so a new id swaps them. */
function Morph({ id, className, innerClassName = "", children }: { id: string; className: string; innerClassName?: string; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const container = outer.parentElement ?? outer;
    let measured = { container: 0, inner: 0 };
    const fit = (animate: boolean) => {
      const from = outer.getBoundingClientRect(); // current, possibly mid-morph, size
      outer.style.transition = "none";
      outer.style.width = "";
      const width = outer.offsetWidth; // the width the stylesheet asks for
      inner.style.width = `${width}px`;
      const height = inner.offsetHeight;
      if (animate) {
        outer.style.width = `${from.width}px`;
        outer.style.height = `${from.height}px`;
      }
      void outer.offsetWidth;
      outer.style.transition = "";
      outer.style.width = `${width}px`;
      outer.style.height = `${height}px`;
      measured = { container: container.clientWidth, inner: height };
    };
    fit(outer.style.height !== ""); // morph when the contents change, snap on first paint
    // Re-fit (snapping) only when the layout really changed: fonts loading, responsive reflow
    const observer = new ResizeObserver(() => {
      if (container.clientWidth !== measured.container || inner.offsetHeight !== measured.inner) fit(false);
    });
    observer.observe(container);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [id]);
  return (
    <div ref={outerRef} className={`ps-morph ${className}`}>
      <div ref={innerRef} key={id} className={`ps-morph__inner ${innerClassName}`.trim()}>{children}</div>
    </div>
  );
}

/** Chat transcript inside the mock browser: user prompt, the agent's steps, and the final answer.
    Each part is a Morph, so switching products reshapes the same bubble, panel and answer. */
function AgentChat({ id, chat }: { id: string; chat: ChatContent }) {
  // compact: the updated Figma transcripts (Search, Browser) with a tighter answer.
  return (
    <div className={`ps-chat${chat.compact ? " ps-chat--compact" : ""}`} data-product={id}>
      <div className="ps-chat__prompt">
        <Morph id={id} className="ps-msg" innerClassName="t-body-s">{chat.prompt}</Morph>
      </div>
      <div className="ps-chat__agent">
        <p className="ps-chat__caption t-body-s">Your agent</p>
        <Morph id={id} className="ps-steps depth-default">{chat.steps}</Morph>
      </div>
      <div className="ps-chat__answer">
        <Morph id={id} className="ps-answer"><p className="t-h6">{chat.answer}</p></Morph>
      </div>
    </div>
  );
}

type Product = {
  id: string;
  title: string;
  description: ReactNode;
  cta: string;
  /** "search" = the laptop art pinned to the copy; "landscape" = art that stretches with the card. */
  tone: "search" | "landscape";
  /** Art box, relative to the card (Figma frame offsets). */
  bg: { left: number; top: number; width: number; height: number; position?: string };
  /** Vector shader loop (.tfv/.tfz in /assets/product-showcase/vector). */
  vector: { src: string; width: number; height: number };
  /** Contents of the shared UI window. */
  chat: ChatContent;
};

/** Where the laptop starts inside the search art, in px from the art's left edge. */
const SEARCH_LAPTOP_LEFT = 239;

const products: Product[] = [
  {
    id: "search-api",
    title: "Search API",
    description: "Fresh results from the live web. Never cached. Real browser-rendered search that returns structured JSON.",
    cta: "Try Search for Free",
    tone: "search",
    bg: { left: -165, top: 92, width: 1541, height: 703, position: "center bottom" },
    vector: { src: "search.tfz", width: 5833, height: 2755 },
    chat: {
      compact: true,
      prompt: searchPrompt,
      steps: (
        <ol className="ps-steps__list">
          <StepRow icon="fish" accent label="Search · “aurora 14 laptop price”" />
          {searchResults.map((r) => <ResultRow key={r.source} {...r} />)}
          <StepRow icon="ellipsis" label="+ 7 more results" detail="556ms" />
        </ol>
      ),
      answer: searchAnswer,
    },
  },
  {
    id: "fetch-api",
    title: "Fetch API",
    description: "From rendered page to clean data in one call. Markdown, JSON or HTML, token-efficient.",
    cta: "Try Fetch for Free",
    tone: "landscape",
    bg: { left: -83, top: 86, width: 1573, height: 674 },
    vector: { src: "fetch-v16.tfv", width: 3444, height: 1698 },
    chat: {
      prompt: <>Read <span className="ps-link">docs.acme.com/api/rate-limits</span> and tell me the enterprise limit.</>,
      steps: (
        <ol className="ps-steps__list">
          <StepRow icon="fish" accent label={<><strong>Fetch</strong> · docs.acme.com/api/rate-limits</>} />
          <li className="ps-step ps-step--block">
            <span className="ps-badge t-label-xs">Rate Limit</span>
            <pre className="ps-markdown t-mono-s">{rateLimitTable}</pre>
          </li>
        </ol>
      ),
      answer: "6,000 requests a minute on enterprise, bursting to 10,000.",
    },
  },
  {
    id: "browser-api",
    title: "Browser API",
    description: "Access the web that search can't reach. A real cloud browser you drive with Playwright, Puppeteer or CDP, with persistent state.",
    cta: "Try Browser",
    tone: "landscape",
    bg: { left: -83, top: 52, width: 1573, height: 674 },
    vector: { src: "browser-v22.tfv", width: 1916, height: 821 },
    chat: {
      compact: true,
      prompt: "Log into the carrier portal and pull our active quotes.",
      steps: <ol className="ps-steps__list">{browserSteps.map((st, i) => <StepRow key={i} {...st} />)}</ol>,
      answer: "Three active quotes: Northwind at $1,284 and Cardinal at $1,410 are approved; Beacon is still pending.",
    },
  },
  {
    id: "agent-api",
    title: "Agent API",
    description: "Navigate, fill forms, authenticate, return structured results. Give it a goal in plain English. It works the live site and brings back the data.",
    cta: "Try Agent",
    tone: "landscape",
    bg: { left: -83, top: -19, width: 1573, height: 674 },
    vector: { src: "agent-v28.tfv", width: 3880, height: 1663 },
    chat: {
      prompt: quotePrompt,
      steps: <ol className="ps-steps__list">{quoteSteps.map((s, i) => <StepRow key={i} {...s} />)}</ol>,
      answer: quoteAnswer,
    },
  },
];

/** Art box for a product, at its Figma size. The laptop art (search) has the laptop's left edge on the
    copy's left edge; the landscapes are centred. Both are scaled down to the card in CSS. */
function artStyle({ tone, bg }: Product): CSSProperties {
  return tone === "search"
    ? { left: `calc(var(--ps-copy-inset) - ${SEARCH_LAPTOP_LEFT}px)`, top: bg.top, width: bg.width, height: bg.height, objectPosition: bg.position }
    : { left: "50%", top: bg.top, width: bg.width, height: bg.height, objectPosition: bg.position };
}

export function ProductShowcase() {
  const [active, setActiveState] = useState(products[0].id);
  const [switched, setSwitched] = useState(false); // headings only animate once the visitor switches tabs
  const setActive = (id: string) => { setActiveState(id); setSwitched(true); };
  const product = products.find((p) => p.id === active) ?? products[0];
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  // Slide the active tab's surface under whichever tab is selected
  const placeIndicator = (animate: boolean) => {
    const indicator = indicatorRef.current;
    const tab = tabsRef.current?.querySelector<HTMLElement>(".ps-tab--active");
    if (!indicator || !tab) return;
    if (!animate) indicator.style.transition = "none";
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.height = `${tab.offsetHeight}px`;
    if (!animate) { void indicator.offsetWidth; indicator.style.transition = ""; }
  };
  // Snap into place on first paint and on resize; only tab switches slide
  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    placeIndicator(false);
    const observer = new ResizeObserver(() => placeIndicator(false));
    observer.observe(tabs);
    tabs.querySelectorAll(".ps-tab").forEach((tab) => observer.observe(tab)); // tab widths change when web fonts load
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    placeIndicator(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <section className="product-showcase-scroll" id="products" aria-label="TinyFish APIs">
      <div className="product-showcase" data-active={active} data-first-active={active === products[0].id || undefined} data-switched={switched || undefined}>
        <div className="ps-main">
          <div ref={tabsRef} className="product-showcase-tabs" role="tablist" aria-label="APIs">
            <span ref={indicatorRef} className="ps-tab-indicator" aria-hidden />
            {products.map((p) => (
              <button key={p.id} id={`${p.id}-tab`} role="tab" aria-selected={active === p.id}
                aria-controls="products-panel" tabIndex={active === p.id ? 0 : -1}
                className={`ps-tab${active === p.id ? " ps-tab--active" : ""}`}
                onClick={() => setActive(p.id)}
                onKeyDown={(event) => {
                  const index = products.findIndex((item) => item.id === active);
                  const next = event.key === "ArrowRight" ? (index + 1) % products.length : event.key === "ArrowLeft" ? (index + products.length - 1) % products.length : event.key === "Home" ? 0 : event.key === "End" ? products.length - 1 : -1;
                  if (next >= 0) { event.preventDefault(); setActive(products[next].id); document.getElementById(`${products[next].id}-tab`)?.focus(); }
                }}>
                {p.title}
              </button>
            ))}
          </div>
          <div className="ps-card" id="products-panel" role="tabpanel" aria-labelledby={`${active}-tab`}>
            {/* Every product's art loads with the card and stays drawn, so switching is a plain cross-fade in
                step with the card colour; only the selected one plays. */}
            {products.map((p) => (
              <div key={p.id} className={`ps-art${active === p.id ? " ps-art--active" : ""}`} data-product={p.id} aria-hidden>
                <VectorLoop className="ps-card__bg" src={`/assets/product-showcase/vector/${p.vector.src}`} width={p.vector.width} height={p.vector.height} style={artStyle(p)} active={active === p.id} />
              </div>
            ))}
            <div className="ps-card__layout">
              <div className="ps-intro" key={product.id}>
                <div className="ps-intro__copy">
                  <h2 className="t-h4">{product.title}</h2>
                  <p className="ps-intro__desc t-body-l">{product.description}</p>
                </div>
                <a className="ps-cta" href="#">{product.cta}</a>
              </div>
            </div>
          </div>
        </div>
        {/* One UI window beside the card for every product. Hidden copies of every transcript share a grid
            cell with the live one, so the window is always as tall as the tallest; the live transcript morphs. */}
        <BrowserWindow className="ps-window">
          <div className="ps-window__viewport">
            {products.map((p) => (
              <div key={p.id} className="ps-window__sizer" aria-hidden><AgentChat id={p.id} chat={p.chat} /></div>
            ))}
            <div className="ps-window__live"><AgentChat id={product.id} chat={product.chat} /></div>
          </div>
        </BrowserWindow>
      </div>
    </section>
  );
}
