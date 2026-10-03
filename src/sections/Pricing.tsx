import type { ReactElement, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import "./Pricing.css";

/* Local stand-ins for the SF Symbols in the API list (tennisball.fill, pointer.arrow, macwindow). */
const symbols: Record<"tennisball" | "pointer" | "macwindow", ReactElement> = {
  tennisball: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path fill="none" style={{ stroke: "var(--pricing-icon-bg)" }} strokeWidth="1.8" d="M5.3 5.4c2.4 1.9 3.7 4.1 3.7 6.6s-1.3 4.7-3.7 6.6M18.7 5.4c-2.4 1.9-3.7 4.1-3.7 6.6s1.3 4.7 3.7 6.6" />
    </>
  ),
  pointer: <path d="M6 3.2v16.1c0 .7.8 1 1.3.5l3.7-3.9 2.7 5.6c.2.4.7.6 1.1.4l1.6-.8c.4-.2.6-.7.4-1.1l-2.7-5.5h5.2c.7 0 1.1-.9.5-1.4L7.4 2.6c-.5-.4-1.4-.1-1.4.6Z" />,
  macwindow: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="2.6" y="4.6" width="18.8" height="14.8" rx="3" />
      <path d="M2.6 9.2h18.8" />
    </g>
  ),
};

function SFSymbol({ name }: { name: keyof typeof symbols }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {symbols[name]}
    </svg>
  );
}

type Api = { name: string; icon: ReactNode; price: ReactNode };

const apis: Api[] = [
  { name: "Search API", icon: <Icon name="search" size={18} />, price: <span className="pricing-api__free t-h6">Free</span> },
  { name: "Fetch API", icon: <SFSymbol name="tennisball" />, price: <span className="pricing-api__free t-h6">Free</span> },
  { name: "Agent API", icon: <SFSymbol name="pointer" />, price: <span className="pricing-api__rate t-body-xl">$0.016 <span>per step</span></span> },
  { name: "Browser API", icon: <SFSymbol name="macwindow" />, price: <span className="pricing-api__rate t-body-xl">$0.002 <span>per min</span></span> },
];

export function Pricing() {
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    list.classList.add("is-entering");
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      list.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(list);
    return () => {
      observer.disconnect();
      list.classList.remove("is-entering", "is-visible");
    };
  }, []);
  return (
    <section className="pricing" id="pricing">
      <div className="pricing__content">
        <header className="pricing__header">
          <h1 className="pricing-pill">
            <span className="pricing-pill__head depth-inner-strong t-h1">Simple pricing for</span>
            <span className="pricing-pill__tab-row">
              <img className="pricing-pill__cutout pricing-pill__cutout--left" src="/assets/pricing/cutout-left.svg" width={16} height={16} alt="" />
              <span className="pricing-pill__tab depth-inner-strong depth-join t-h1">real web work.</span>
              <img className="pricing-pill__cutout" src="/assets/pricing/cutout-right.svg" width={16} height={16} alt="" />
            </span>
          </h1>
          <div className="pricing__actions">
            <Button size="l" href="#get-started" className="pricing__cta-free">Get $8 free</Button>
            <Button variant="outline" size="l" href="#pricing-details">See full pricing</Button>
          </div>
        </header>
        <ul ref={listRef} className="pricing-api-list" aria-label="API pricing">
          {apis.map((api) => (
            <li key={api.name} className="pricing-api depth-default">
              <div className="pricing-api__lead">
                <span className="pricing-api__icon depth-subtle">{api.icon}</span>
                <span className="t-h6">{api.name}</span>
              </div>
              <span className="pricing-api__price">{api.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
