import { Button } from "./Button";
import "./TopBar.css";

const NAV_LINKS = ["Product", "Solutions", "Resources", "Company", "Pricing"];

/** Figma "Navigation / Top Bar": logo, primary links, Contact | Login + Sign Up. */
export function TopBar({ className = "", label = "Primary" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const query = window.matchMedia("(max-width: 1280px)");
    const onResize = () => { if (!query.matches) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    query.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      query.removeEventListener("change", onResize);
    };
  }, [open]);
  return (
    <header ref={header} className={`topbar ${className}`.trim()}>
      <a href="#" className="topbar__logo" aria-label="TinyFish home">
        <span className="topbar__brand" aria-hidden />
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
      <button ref={toggle} type="button" className="topbar__toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d={open ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      <nav id={menuId} className={`topbar__menu t-body-m${open ? " is-open" : ""}`} aria-label={`${label} menu`} inert={!open} onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>
        {NAV_LINKS.map((link) => <a key={link} href={`#${link.toLowerCase()}`}>{link}</a>)}
        <a href="#contact">Contact</a>
        <a href="#login">Login</a>
        <Button variant="black" size="s">Sign Up</Button>
      </nav>
    </header>
  );
}
import { useEffect, useId, useRef, useState } from "react";
