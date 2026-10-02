import { Button } from "../components/Button";
import { HeadingPill } from "../components/HeadingPill";
import "./Hero.css";

const navLinks = ["Product", "Solutions", "Resources", "Company", "Pricing"];

const aiLogos = ["ai-logo-1", "ai-logo-2", "ai-logo-3"];

const customerLogos = [
  { file: "logo-google", name: "Google", w: 51.6667, h: 16.6667 },
  { file: "logo-grubhub", name: "Grubhub", w: 57.5, h: 11.6667 },
  { file: "logo-getgo", name: "GetGo", w: 25.8333, h: 23.6806 },
  { file: "logo-amazon", name: "Amazon", w: 52.5, h: 17.5 },
  { file: "logo-x", name: "Partner", w: 24.1667, h: 18.5897 },
  { file: "logo-doordash", name: "DoorDash", w: 96.6667, h: 11.6667 },
  { file: "logo-zebra", name: "The Zebra", w: 54.1667, h: 16.6667 },
];

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__card depth-default">
        <img className="hero__bg" src="/assets/hero/hero-bg.png" alt="" />

        <header className="topbar">
          <a href="#" className="topbar__logo" aria-label="TinyFish home">
            <img src="/assets/hero/brand-logo.svg" width={70} height={16} alt="TinyFish" />
          </a>
          <nav className="topbar__nav t-body-s" aria-label="Primary">
            {navLinks.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>
            ))}
          </nav>
          <div className="topbar__actions t-body-s">
            <a href="#contact">Contact</a>
            <img className="topbar__separator" src="/assets/hero/separator.svg" width={20} height={1} alt="" />
            <a href="#login">Login</a>
            <Button variant="black" size="s">Sign Up</Button>
          </div>
        </header>

        <div className="hero__main">
          <HeadingPill as="h1" heading="The web stack for AI agents" body="Search, extract, browse, and act on the web with one platform." />
          <Button variant="accent" size="l">Connect TinyFish</Button>
          <div className="hero__tagline">
            <p>Works with any AI</p>
            <div className="hero__ai-logos">
              {aiLogos.map((f) => (
                <img key={f} src={`/assets/hero/${f}.svg`} width={20} height={20} alt="" />
              ))}
            </div>
          </div>
          <ul className="hero__logos" aria-label="Trusted by">
            {customerLogos.map((l) => (
              <li key={l.file}>
                <img src={`/assets/hero/${l.file}.svg`} width={l.w} height={l.h} alt={l.name} />
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__footer">
          <div className="hero__promo depth-default">
            <p className="t-body-m">Search and Fetch APIs free on every plan.</p>
            <Button variant="neutral" size="s" className="hero__promo-btn">Get started</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
