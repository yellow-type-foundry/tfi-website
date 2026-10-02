import type { ReactNode } from "react";
import "./HeadingPill.css";

/** The raised grey heading block with the attached subtitle tab (Hero, "Use with" section). */
export function HeadingPill({ heading, body, as: Tag = "h2" }: { heading: ReactNode; body: ReactNode; as?: "h1" | "h2" }) {
  return (
    <div className="heading-pill">
      <div className="heading-pill__head depth-inner-strong">
        <Tag className="heading-pill__title t-h1">{heading}</Tag>
      </div>
      <div className="heading-pill__tab-row">
        <img className="heading-pill__cutout heading-pill__cutout--left" src="/assets/hero/cutout-left.svg" width={16} height={16} alt="" />
        <div className="heading-pill__tab depth-inner-strong depth-join">
          <p className="t-body-xl">{body}</p>
        </div>
        <img className="heading-pill__cutout" src="/assets/hero/cutout-right.svg" width={16} height={16} alt="" />
      </div>
    </div>
  );
}
