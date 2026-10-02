import type { CSSProperties, ReactNode } from "react";
import "./BrowserWindow.css";

type BrowserWindowProps = {
  url?: string;
  /** Right side of the title bar; when omitted, invisible dots keep the URL centred. */
  trailing?: ReactNode;
  gap?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

const Dots = ({ hidden }: { hidden?: boolean }) => (
  <div className={`browser__dots${hidden ? " browser__dots--hidden" : ""}`} aria-hidden>
    <span /><span /><span />
  </div>
);

/** Mock browser chrome used in the Solutions cards and product previews. */
export function BrowserWindow({ url, trailing, gap = 12, className = "", style, children }: BrowserWindowProps) {
  return (
    <div className={`browser ${className}`.trim()} style={style}>
      <div className="browser__bar" style={{ gap }}>
        <Dots />
        {url !== undefined && <p className="browser__url t-mono-s">{url}</p>}
        {trailing ?? <Dots hidden />}
      </div>
      <div className="browser__body">{children}</div>
    </div>
  );
}
