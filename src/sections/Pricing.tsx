import type { ReactElement, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import "./Pricing.css";

/* Icons for the API list: the TinyFish Fetch icon (19px artwork, centred in the 24px grid) and local
   stand-ins for the SF Symbols pointer.arrow and macwindow. */
const symbols: Record<"fetch" | "pointer" | "macwindow", ReactElement> = {
  fetch: <path transform="translate(2.71 2.72)" d="M0.158203 7.55859C0.380859 6.36328 0.814453 5.26758 1.45898 4.27148C2.10938 3.27539 2.91504 2.43164 3.87598 1.74023C4.83691 1.04297 5.89746 0.550781 7.05762 0.263672C7.20996 0.597656 7.32129 0.9375 7.3916 1.2832C7.46777 1.62891 7.50586 1.99512 7.50586 2.38184C7.50586 3.16113 7.36816 3.88477 7.09277 4.55273C6.82324 5.21484 6.43945 5.79199 5.94141 6.28418C5.44922 6.77051 4.87207 7.15137 4.20996 7.42676C3.55371 7.70215 2.83594 7.83984 2.05664 7.83984C1.72266 7.83984 1.40332 7.81641 1.09863 7.76953C0.793945 7.7168 0.480469 7.64648 0.158203 7.55859ZM9.28125 18.5625C8.00391 18.5625 6.80273 18.3193 5.67773 17.833C4.55859 17.3525 3.57422 16.6875 2.72461 15.8379C1.875 14.9883 1.20703 14.0039 0.720703 12.8848C0.240234 11.7598 0 10.5586 0 9.28125C0 9.2168 0 9.15527 0 9.09668C0 9.03809 0.00292969 8.98242 0.00878906 8.92969C0.331055 9.03516 0.662109 9.11719 1.00195 9.17578C1.34766 9.22852 1.69922 9.25488 2.05664 9.25488C3.00586 9.25488 3.89355 9.0791 4.71973 8.72754C5.55176 8.37012 6.28125 7.87793 6.9082 7.25098C7.53516 6.61816 8.02734 5.88574 8.38477 5.05371C8.74219 4.22168 8.9209 3.33105 8.9209 2.38184C8.9209 1.95996 8.88574 1.55273 8.81543 1.16016C8.74512 0.761719 8.63086 0.386719 8.47266 0.0351562C8.60156 0.0234375 8.7334 0.0146484 8.86816 0.00878906C9.00293 0.00292969 9.14062 0 9.28125 0C10.5645 0 11.7656 0.240234 12.8848 0.720703C14.0098 1.20117 14.9971 1.86621 15.8467 2.71582C16.6963 3.56543 17.3613 4.55273 17.8418 5.67773C18.3281 6.79688 18.5713 7.99805 18.5713 9.28125C18.5713 9.32812 18.5684 9.375 18.5625 9.42188C18.5625 9.46875 18.5596 9.51562 18.5537 9.5625C18.249 9.45117 17.9297 9.36914 17.5957 9.31641C17.2617 9.25781 16.9219 9.22852 16.5762 9.22852C15.627 9.22852 14.7363 9.40723 13.9043 9.76465C13.0781 10.1221 12.3486 10.6172 11.7158 11.25C11.0889 11.877 10.5967 12.6064 10.2393 13.4385C9.8877 14.2646 9.71191 15.1523 9.71191 16.1016C9.71191 16.5293 9.75 16.9482 9.82617 17.3584C9.90234 17.7686 10.0225 18.1523 10.1865 18.5098C10.04 18.5273 9.89062 18.5391 9.73828 18.5449C9.5918 18.5566 9.43945 18.5625 9.28125 18.5625ZM11.5928 18.2549C11.4346 17.9326 11.3174 17.5928 11.2412 17.2354C11.165 16.8779 11.127 16.5 11.127 16.1016C11.127 15.3223 11.2646 14.6016 11.54 13.9395C11.8154 13.2773 12.1963 12.7002 12.6826 12.208C13.1748 11.7158 13.752 11.332 14.4141 11.0566C15.0762 10.7812 15.7969 10.6436 16.5762 10.6436C16.9102 10.6436 17.2266 10.6729 17.5254 10.7314C17.8242 10.7842 18.1201 10.8545 18.4131 10.9424C18.1963 12.126 17.7686 13.2158 17.1299 14.2119C16.4912 15.208 15.6973 16.0576 14.748 16.7607C13.7988 17.4639 12.7471 17.9619 11.5928 18.2549Z" />,
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
    <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {symbols[name]}
    </svg>
  );
}

type Api = { name: string; icon: ReactNode; price: ReactNode };

const apis: Api[] = [
  { name: "Search API", icon: <Icon name="search" size={26} />, price: <span className="pricing-api__free t-h6">Free</span> },
  { name: "Fetch API", icon: <SFSymbol name="fetch" />, price: <span className="pricing-api__free t-h6">Free</span> },
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
            <span className="pricing-pill__head depth-inner-strong t-h1"><span className="pricing-pill__text">Simple pricing for</span></span>
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
            <li key={api.name} className="pricing-api">
              <div className="pricing-api__lead">
                <span className="pricing-api__icon depth-default">{api.icon}</span>
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
