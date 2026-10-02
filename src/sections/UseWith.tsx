import { Button } from "../components/Button";
import { HeadingPill } from "../components/HeadingPill";
import "./UseWith.css";

/** "Use with ChatGPT, Claude, Hermes, or in your code." band. */
export function UseWith() {
  return (
    <section className="use-with">
      <div className="use-with__content">
        <HeadingPill
          heading={
            <span className="use-with__heading">
              <span className="use-with__line">
                Use with
                <span className="use-with__brand">
                  <span className="use-with__shader use-with__shader--chatgpt" style={{ backgroundImage: "url(/assets/use-with/shader-a.png)" }} aria-hidden />
                  ChatGPT,
                </span>
                <span className="use-with__brand">
                  <span className="use-with__shader use-with__shader--claude" style={{ backgroundImage: "url(/assets/use-with/shader-b.png)" }} aria-hidden />
                  Claude,
                </span>
              </span>
              <span className="use-with__line use-with__line--center">
                <span className="use-with__hermes">
                  <img src="/assets/use-with/hermes-logo.svg" width={57.4527} height={57.6734} alt="" />
                </span>
                Hermes, or in your code.
              </span>
            </span>
          }
          body="Search, extract, browse, and act on the web with one platform."
        />
        <div className="use-with__actions">
          <Button variant="black" size="l">Connect TinyFish</Button>
          <Button variant="outline" size="l">View API docs</Button>
        </div>
      </div>
    </section>
  );
}
