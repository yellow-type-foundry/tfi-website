import { Button } from "./Button";
import "./TopBar.css";

const NAV_LINKS = ["Product", "Solutions", "Resources", "Company", "Pricing"];

/** Figma "Navigation / Top Bar": logo, primary links, Contact | Login + Sign Up. */
export function TopBar({ className = "", label = "Primary" }: { className?: string; label?: string }) {
  return (
    <header className={`topbar ${className}`.trim()}>
      <a href="#" className="topbar__logo" aria-label="TinyFish home">
        <img src="/assets/hero/brand-logo.svg" width={70} height={16} alt="TinyFish" />
      </a>
      <nav className="topbar__nav t-body-m" aria-label={label}>
        {NAV_LINKS.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>
        ))}
      </nav>
      <div className="topbar__actions t-body-m">
        <a href="#contact">Contact</a>
        <img className="topbar__separator" src="/assets/hero/separator.svg" width={20} height={1} alt="" />
        <a href="#login">Login</a>
        <Button variant="black" size="s" className="topbar__signup">Sign Up</Button>
      </div>
    </header>
  );
}
