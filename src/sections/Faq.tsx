import { Fragment, useId, useState } from "react";
import { Icon } from "../components/Icon";
import "./Faq.css";

// Questions come from the Figma "FAQ List"; the answers are placeholder copy (not in the design).
const faqs = [
  {
    q: "How is this different from other tools?",
    a: "TinyFish puts search, fetch, and a real browser behind one API built for agents. Instead of stitching together a scraper, a proxy pool, and a headless browser, your agent gets clean, structured results from a single platform.",
  },
  {
    q: "Why would I use this instead of my LLM's built-in web search?",
    a: "Built-in search returns a handful of snippets. TinyFish lets your agent fetch full pages, extract exactly the fields it needs, and act on sites that require clicks, forms, or logins, with results you control and can cache.",
  },
  {
    q: "What does 'stealth' mean?",
    a: "Stealth sessions run in real browser fingerprints with residential networking, so agents load pages the way a person would and avoid being blocked by bot detection on sites they are permitted to access.",
  },
  {
    q: "How accurate is the Agent?",
    a: "The Agent is evaluated against public web-task benchmarks and returns structured output with the source pages it used, so you can verify every answer. Accuracy varies by task; see our Benchmarks page for details.",
  },
  {
    q: "Can agents authenticate into websites?",
    a: "Yes. You can provide credentials or session cookies through a secure vault, and the browser API will sign in and keep the session alive while your agent works. Credentials are never exposed to the model.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section className="faq">
      <h2 className="faq__title t-h2">Common questions.</h2>
      <div className="faq__list">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          const btnId = `${baseId}-q${i}`;
          const panelId = `${baseId}-a${i}`;
          return (
            <Fragment key={item.q}>
              {i > 0 && <img className="faq__divider" src="/assets/faq/divider.svg" width={800} height={1} alt="" />}
              <div className={`faq__item${isOpen ? " is-open" : ""}`}>
                <h3 className="faq__heading">
                  <button
                    id={btnId}
                    type="button"
                    className="faq__trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="faq__question t-label-xl">{item.q}</span>
                    <span className="faq__icon" aria-hidden>
                      <Icon name="plus" size={18} />
                    </span>
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} className="faq__panel" inert={!isOpen}>
                  <div className="faq__panel-inner">
                    <p className="faq__answer t-body-m">{item.a}</p>
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
