import type { ReactNode } from "react";
import "./MobileSteppedHeading.css";

export function MobileSteppedHeading({ first, second, third, body, as: Tag = "h2" }: { first: string; second: string; third?: string; body: ReactNode; as?: "h1" | "h2" }) {
  return (
          <div className="mobile-stepped-heading">
            <Tag className="mobile-stepped-heading__title t-h1">
              <span className="mobile-stepped-heading__first">{first}</span>
              <span className="mobile-stepped-heading__row">
                <img src="/assets/hero/cutout-left.svg" width={16} height={16} alt="" />
                <span className="mobile-stepped-heading__second">{second}</span>
                <img src="/assets/hero/cutout-right.svg" width={16} height={16} alt="" />
              </span>
              {third && <span className="mobile-stepped-heading__row mobile-stepped-heading__row--third">
                <img src="/assets/hero/cutout-left.svg" width={16} height={16} alt="" />
                <span className="mobile-stepped-heading__second">{third}</span>
                <img src="/assets/hero/cutout-right.svg" width={16} height={16} alt="" />
              </span>}
            </Tag>
            <div className="mobile-stepped-heading__body-row">
              <img src="/assets/hero/cutout-left.svg" width={16} height={16} alt="" />
              <p>{body}</p>
              <img src="/assets/hero/cutout-right.svg" width={16} height={16} alt="" />
            </div>
          </div>
  );
}
