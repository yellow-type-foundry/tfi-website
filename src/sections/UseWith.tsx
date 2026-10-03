import { Button } from "../components/Button";
import "../components/HeadingPill.css";
import { VectorLoop } from "../components/VectorLoop";
import "./UseWith.css";

const Cutout = ({ side }: { side: "left" | "right" }) => (
  <img className={`heading-pill__cutout${side === "left" ? " heading-pill__cutout--left" : ""}`} src={`/assets/hero/cutout-${side}.svg`} width={16} height={16} alt="" />
);

/** "Use with ChatGPT, Claude, Hermes, or in your code." band. */
export function UseWith() {
  return (
    <section className="use-with">
      <div className="use-with__content">
        {/* Raised heading in two stepped rows: line 1 in the wide block, the shorter line 2 in a tab that
            steps in with its own cutouts, then the subtitle tab (the shared HeadingPill surfaces). */}
        <div className="heading-pill use-with__pill">
          <h2 className="visually-hidden">Use with ChatGPT, Claude, Hermes, or in your code.</h2>
          <div className="heading-pill__head depth-inner-strong" aria-hidden>
            <p className="use-with__line t-h1">
              Use with{" "}
              <span className="use-with__brand">
                <span className="use-with__chatgpt">
                  <VectorLoop className="use-with__chatgpt-animation" src="/assets/use-with/chatgpt.tfv" width={1440} height={1440} />
                </span>
                ChatGPT,
              </span>{" "}
              <span className="use-with__brand use-with__claude-desktop">
                <span className="use-with__claude">
                  <VectorLoop className="use-with__claude-animation" src="/assets/use-with/claude.tfv" width={1440} height={1440} excludeFramesWithLayer={0} />
                </span>
                Claude,
              </span>
            </p>
          </div>
          <div className="heading-pill__tab-row use-with__row" aria-hidden>
            <Cutout side="left" />
            <div className="heading-pill__tab use-with__title-tab depth-inner-strong depth-join">
              <p className="use-with__line t-h1">
              <span className="use-with__brand use-with__claude-tablet">
                <span className="use-with__claude">
                  <VectorLoop className="use-with__claude-animation" src="/assets/use-with/claude.tfv" width={1440} height={1440} excludeFramesWithLayer={0} />
                </span>
                Claude,
              </span>{" "}
                <span className="use-with__brand">
                  <span className="use-with__hermes">
                    <VectorLoop className="use-with__hermes-animation" src="/assets/use-with/hermes.tfv" width={1440} height={1440} />
                  </span>
                  Hermes,
                </span>{" "}
                <span className="use-with__code">or in your code.</span>
              </p>
            </div>
            <Cutout side="right" />
          </div>
          <div className="heading-pill__tab-row use-with__row use-with__code-row" aria-hidden>
            <Cutout side="left" />
            <div className="heading-pill__tab use-with__title-tab depth-inner-strong depth-join">
              <p className="use-with__line t-h1">or in your code.</p>
            </div>
            <Cutout side="right" />
          </div>
          <div className="heading-pill__tab-row use-with__row">
            <Cutout side="left" />
            <div className="heading-pill__tab depth-inner-strong depth-join">
              <p className="t-body-xl">Search, extract, browse, and act on the web with one platform.</p>
            </div>
            <Cutout side="right" />
          </div>
        </div>
        <div className="use-with__actions">
          <Button variant="black" size="l">Connect TinyFish</Button>
          <Button variant="outline" size="l">View API docs</Button>
        </div>
      </div>
    </section>
  );
}
