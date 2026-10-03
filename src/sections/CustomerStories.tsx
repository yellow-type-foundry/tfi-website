import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { Button } from "../components/Button";
import "./CustomerStories.css";

type Story = {
  id: string;
  quote: string;
  name: string;
  role: string;
  /** Card 1 sets the whole byline in primary; the others mute the role. */
  mutedRole: boolean;
  bg: string;
  art: string;
  /** Figma image fill geometry: wrapper box anchored to the card bottom, plus the image crop inside it. */
  frame: { width: number; height: number; offsetX: number };
  img: CSSProperties;
  logo: { src: string; width: number; height: number; left: number; top: number; alt: string };
};

const classpassLogo = { src: "/assets/customer-stories/logo-classpass.svg", width: 134, height: 20, left: 389.34, top: 29.54, alt: "ClassPass" };

const stories: Story[] = [
  {
    id: "classpass",
    art: "/assets/customer-stories/classpass-bg-v33.png",
    quote: "“TinyFish builds AI agent solutions that deliver real results.”",
    name: "Jonathan Lam",
    role: "Senior Program Manager",
    mutedRole: false,
    bg: "#3196e9",
    frame: { width: 780, height: 561, offsetX: 110 },
    img: { inset: 0, width: "100%", height: "100%", objectFit: "cover" },
    logo: classpassLogo,
  },
  {
    id: "doordash",
    art: "/assets/customer-stories/doordash-bg-new.png",
    quote: "“TinyFish's platform manages web interaction complexity at scale.”",
    name: "Abhi Shah",
    role: "Director of Data Science",
    mutedRole: true,
    bg: "#fdddb4",
    frame: { width: 874, height: 583, offsetX: 16 },
    img: { inset: 0, width: "100%", height: "100%", objectFit: "cover" },
    logo: { src: "/assets/customer-stories/logo-doordash.svg", width: 130.333, height: 14, left: 401, top: 28, alt: "DoorDash" },
  },
  {
    id: "starr",
    art: "/assets/customer-stories/card-starr-bg.png",
    quote: "“We have a lot of data already, but we were missing genuine crowd- sourced sentiment. TinyFish fills that intelligence gap really well.”",
    name: "Emily Starr",
    role: "Associate Director, Revenue Analytics",
    mutedRole: true,
    bg: "#3196e9",
    frame: { width: 926, height: 565, offsetX: 0 },
    img: { left: "-15.25%", top: "-1.08%", width: "130.5%", height: "101.08%" },
    logo: classpassLogo,
  },
];

const CARD_STEP = 560 + 24; // card width + gap
const AUTOPLAY_MS = 6000;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Raised white quote block with the attached byline tab (Surface/Strong). */
function QuoteBlock({ story }: { story: Story }) {
  return (
    <div className="story-quote">
      <blockquote className="story-quote__head depth-inner-default">
        <p className="t-h5">{story.quote}</p>
      </blockquote>
      <div className="story-quote__tab-row">
        <p className="story-quote__tab depth-inner-default depth-join t-label-l">
          {story.name} •{" "}
          <span className={story.mutedRole ? "story-quote__role--muted" : undefined}>{story.role}</span>
        </p>
        <img className="story-quote__cutout" src="/assets/customer-stories/card-cutout.svg" width={16} height={16} alt="" />
      </div>
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  const { frame, logo } = story;
  return (
    <>
      <div
        className="story-card__art"
        style={{ width: frame.width, height: frame.height, left: `calc(50% + ${frame.offsetX}px)` }}
        aria-hidden
      >
        <img src={story.art} alt="" style={story.img} draggable={false} />
      </div>
      <img
        className="story-card__logo"
        src={logo.src}
        width={logo.width}
        height={logo.height}
        style={{ left: logo.left, top: logo.top }}
        alt={logo.alt}
        draggable={false}
      />
      <QuoteBlock story={story} />
    </>
  );
}

/** Centred carousel: the active story sits in the middle, neighbours peek in on both sides, and it loops forever. */
function StoryCarousel() {
  const n = stories.length;
  const [pos, setPos] = useState(0); // unbounded so cards always slide the short way round
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const swiped = useRef(false);

  const go = useCallback((delta: number) => setPos((p) => p + delta), []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [paused, go, pos]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };
  const onPointerDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, id: e.pointerId };
    swiped.current = false;
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = drag.current;
    drag.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 40) {
      swiped.current = true; // swallow the click that follows a swipe ending on a neighbour card
      go(dx < 0 ? 1 : -1);
    }
  };

  // Render three slots either side of the active one so the row fills wide screens;
  // the outermost slots sit off-screen up to ~2900px so incoming cards slide in.
  const slots: ReactNode[] = [];
  for (let k = pos - 3; k <= pos + 3; k++) {
    const rel = k - pos;
    const story = stories[mod(k, n)];
    const isActive = rel === 0;
    const isNeighbour = Math.abs(rel) === 1;
    slots.push(
      <article
        key={k}
        className={`story-card${isActive ? " story-card--active" : ""}`}
        style={{ background: story.bg, transform: `translateX(${rel * CARD_STEP}px)` }}
        aria-roledescription="slide"
        aria-label={`${mod(k, n) + 1} of ${n}`}
        inert={!isActive && !isNeighbour}
      >
        <StoryCard story={story} />
        {isNeighbour && (
          <button
            type="button"
            className="story-card__hit"
            onClick={() => { if (!swiped.current) go(rel); }}
            aria-label={rel < 0 ? "Show previous story" : "Show next story"}
          />
        )}
      </article>,
    );
  }

  return (
    <div
      className="story-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer stories"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { drag.current = null; }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="story-carousel__cards">{slots}</div>
      <div className="story-pagination" role="group" aria-label="Choose customer story">
        {stories.map((story, index) => (
          <button
            key={story.id}
            type="button"
            className="story-pagination__dot"
            aria-label={`Show story ${index + 1}: ${story.name}`}
            aria-current={mod(pos, n) === index ? "true" : undefined}
            onClick={() => {
              const delta = mod(index - mod(pos, n) + Math.floor(n / 2), n) - Math.floor(n / 2);
              go(delta);
            }}
          />
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {`Story ${mod(pos, n) + 1} of ${n}: ${stories[mod(pos, n)].name}`}
      </p>
    </div>
  );
}

export function CustomerStories() {
  return (
    <section className="customer-stories" id="customer-stories">
      <header className="customer-stories__header">
        <div className="cs-mobile-heading">
          <h1 className="t-h1">Trusted by 200K developers and the team behind them</h1>
          <p className="t-body-xl">Search, extract, browse, and act on the web with one platform.</p>
        </div>
        <div className="cs-pill">
          {/* Stepped title: the longer first line in the block, the second in a tab with its own cutouts */}
          <h1 className="visually-hidden">Trusted by 200K developers and the team behind them</h1>
          <div className="cs-pill__head depth-inner-strong" aria-hidden>
            <p className="cs-pill__title t-h1">Trusted by 200K<span className="cs-mobile-break" /> developers<span className="cs-desktop-and"> and</span></p>
          </div>
          <div className="cs-pill__tab-row" aria-hidden>
            <img className="cs-pill__cutout cs-pill__cutout--left" src="/assets/customer-stories/cutout-left.svg" width={16} height={16} alt="" />
            <div className="cs-pill__tab cs-pill__tab--title depth-inner-strong depth-join">
              <p className="cs-pill__title t-h1"><span className="cs-tablet-and">and </span>the team behind them</p>
            </div>
            <img className="cs-pill__cutout" src="/assets/customer-stories/cutout-right.svg" width={16} height={16} alt="" />
          </div>
          <div className="cs-pill__tab-row">
            <img className="cs-pill__cutout cs-pill__cutout--left" src="/assets/customer-stories/cutout-left.svg" width={16} height={16} alt="" />
            <div className="cs-pill__tab depth-inner-strong depth-join">
              <p className="t-body-xl">Search, extract, browse, and act on the web with one platform.</p>
            </div>
            <img className="cs-pill__cutout" src="/assets/customer-stories/cutout-right.svg" width={16} height={16} alt="" />
          </div>
        </div>
        <Button variant="black" size="l" href="#customer-stories">Customer Stories</Button>
      </header>
      <StoryCarousel />
    </section>
  );
}
