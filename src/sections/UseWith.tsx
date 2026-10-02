import { Button } from "../components/Button";
import { VectorLoop } from "../components/VectorLoop";
import "./UseWith.css";

/** "Use with ChatGPT, Claude, Hermes, or in your code." band. */
export function UseWith() {
  return (
    <section className="use-with">
      <div className="use-with__content">
        <div className="use-with__intro">
            <h1 className="use-with__heading t-h1">
                <span className="use-with__phrase">Use with</span>{" "}
                <span className="use-with__brand">
                  <span className="use-with__chatgpt">
                    <VectorLoop className="use-with__chatgpt-animation" src="/assets/use-with/chatgpt.tfv" width={1440} height={1440} />
                  </span>
                  ChatGPT,
                </span>{" "}
                <span className="use-with__brand">
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
                or in your code.
            </h1>
            <p className="t-body-xl">Search, extract, browse, and act on the web with one platform.</p>
        </div>
        <div className="use-with__actions">
          <Button variant="black" size="l">Connect TinyFish</Button>
          <Button variant="outline" size="l">View API docs</Button>
        </div>
      </div>
    </section>
  );
}
