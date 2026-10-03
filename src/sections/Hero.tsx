import { Button } from "../components/Button";
import { HeadingPill } from "../components/HeadingPill";
import { TopBar } from "../components/TopBar";
import { VectorLoop } from "../components/VectorLoop";
import "./Hero.css";

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
        {/* Vector loop with push-on-hover; its sky is already the card's Brand/Yellow/400. */}
        <VectorLoop className="hero__bg" src="/assets/hero/vector/hero-v36.tfv" width={1920} height={1211} />

        <TopBar className="hero__topbar" />

        <div className="hero__main">
          <HeadingPill as="h1" heading={<><span>The web stack</span>{" "}<span>for AI agents</span></>} body="Search, extract, browse, and act on the web with one platform." />
          <Button variant="accent" size="l">Connect TinyFish</Button>
          <div className="hero__tagline">
            <p>Works with any AI</p>
            <div className="hero__ai-logos">
              {aiLogos.map((f) => (
                <img key={f} src={`/assets/hero/${f}.svg`} width={20} height={20} alt="" />
              ))}
            </div>
          </div>
          {/* Auto-scrolling logo carousel: two identical sets scroll left; the second is decorative. */}
          <div className="hero__logos">
            <div className="hero__logos-track">
              {[0, 1].map((copy) => (
                <ul key={copy} className="hero__logos-set" aria-label={copy === 0 ? "Trusted by" : undefined} aria-hidden={copy === 1 || undefined}>
                  {customerLogos.map((l) => (
                    <li key={l.file}>
                      <img src={`/assets/hero/${l.file}.svg`} width={l.w} height={l.h} alt={copy === 0 ? l.name : ""} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
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
