import type { ReactNode } from "react";
import "./MobileSteppedHeading.css";

export function MobileSteppedHeading({ first, second, third, fourth, body, as: Tag = "h2" }: { first: string; second: string; third?: string; fourth?: string; body: ReactNode; as?: "h1" | "h2" }) {
  return (
          <div className="mobile-stepped-heading">
            <div className="mobile-stepped-heading__pill">
            <Tag className="mobile-stepped-heading__title t-h1">
              <span className="mobile-stepped-heading__first depth-inner-default">{first}</span>
              <span className="mobile-stepped-heading__row">
                <img src="/assets/hero/cutout-left.svg" width={16} height={16} alt="" />
                <span className="mobile-stepped-heading__second depth-inner-default depth-join">{second}</span>
                <img src="/assets/hero/cutout-right.svg" width={16} height={16} alt="" />
              </span>
              {third && <span className="mobile-stepped-heading__row mobile-stepped-heading__row--third">
                <img src="/assets/hero/cutout-left.svg" width={16} height={16} alt="" />
                <span className="mobile-stepped-heading__second depth-inner-default depth-join">{third}</span>
                <img src="/assets/hero/cutout-right.svg" width={16} height={16} alt="" />
              </span>}
              {fourth && <span className="mobile-stepped-heading__row mobile-stepped-heading__row--fourth">
                <img src="/assets/hero/cutout-left.svg" width={16} height={16} alt="" />
                <span className="mobile-stepped-heading__second depth-inner-default depth-join">{fourth}</span>
                <img src="/assets/hero/cutout-right.svg" width={16} height={16} alt="" />
              </span>}
            </Tag>
            </div>
            {/* The body sits below the pill as plain text, not in a tab of its own */}
            <p className="mobile-stepped-heading__body">{body}</p>
          </div>
  );
}
