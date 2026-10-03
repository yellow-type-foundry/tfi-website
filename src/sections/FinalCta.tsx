import { Button } from "../components/Button";
import { VectorLoop } from "../components/VectorLoop";
import "./FinalCta.css";

const aiLogos = ["ai-logo-1", "ai-logo-2", "ai-logo-3"];

const Cutout = ({ side }: { side: "left" | "right" }) => (
  <img
    className={`final-cta__cutout final-cta__cutout--${side}`}
    src={`/assets/final-cta/cutout-${side}.svg`}
    width={16}
    height={16}
    alt=""
  />
);

export function FinalCta() {
  return (
    <section className="final-cta">
      <div className="final-cta__card depth-default">
        <div className="final-cta__background">
          <VectorLoop className="final-cta__bg" src="/assets/final-cta/background-v32.tfv" width={1440} height={1175} />
        </div>

        <div className="final-cta__content">
          <div className="final-cta__pill">
            <h2 className="visually-hidden">Give your agent the real world.</h2>
            <div className="final-cta__head final-cta__surface" aria-hidden>
              <p className="t-h1">Give your agent</p>
            </div>
            <div className="final-cta__row" aria-hidden>
              <Cutout side="left" />
              <div className="final-cta__tab final-cta__tab--title final-cta__surface depth-join">
                <p className="t-h1">the real world.</p>
              </div>
              <Cutout side="right" />
            </div>
            <div className="final-cta__row">
              <Cutout side="left" />
              <div className="final-cta__tab final-cta__tab--body final-cta__surface depth-join">
                <p className="t-body-xl">Search and Fetch are free on every plan.</p>
              </div>
              <Cutout side="right" />
            </div>
          </div>

          <Button variant="accent" size="l">Connect TinyFish</Button>

          <div className="final-cta__note">
            <p>Works with any AI</p>
            <div className="final-cta__logos">
              {aiLogos.map((f) => (
                <img key={f} src={`/assets/final-cta/${f}.svg`} width={20} height={20} alt="" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
