import "./Footer.css";

type FooterLink = { label: string; href: string };
const link = (label: string, href = "#"): FooterLink => ({ label, href });

const productColumns = [
  [link("Mako"), link("Enterprise"), link("Solutions"), link("Customers"), link("Pricing")],
  [link("Partners"), link("Integrations"), link("Compare"), link("Docs"), link("Trust")],
];
const resourceColumns = [
  [link("Benchmarks"), link("Cookbook"), link("Blog"), link("Pulse"), link("Current")],
  [link("Accelerator"), link("Students"), link("Ambassadors")],
];
const connectLinks = [link("X/Twitter"), link("LinkedIn"), link("Discord"), link("GitHub"), link("Contact Us")];
const legalLinks = [link("Privacy"), link("Cookies"), link("Terms")];
const socials = [
  { file: "social-x", label: "X/Twitter" },
  { file: "social-linkedin", label: "LinkedIn" },
  { file: "social-github", label: "GitHub" },
  { file: "social-discord", label: "Discord" },
];

const LinkList = ({ links }: { links: FooterLink[] }) => (
  <ul className="footer__links">
    {links.map((l) => (
      <li key={l.label}>
        <a href={l.href}>{l.label}</a>
      </li>
    ))}
  </ul>
);

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <a href="#" aria-label="TinyFish home">
            <span className="footer__logo" role="img" aria-label="TinyFish" />
          </a>
          <p className="footer__tagline t-h4">Web APIs built for agents.</p>
        </div>

        <nav className="footer__nav t-body-s" aria-label="Footer">
          <div className="footer__group">
            <p className="footer__group-title t-label-m">Products</p>
            <div className="footer__columns">
              {productColumns.map((col, i) => <LinkList key={i} links={col} />)}
            </div>
          </div>
          <div className="footer__group">
            <p className="footer__group-title t-label-m">Resources</p>
            <div className="footer__columns">
              {resourceColumns.map((col, i) => <LinkList key={i} links={col} />)}
            </div>
          </div>
          <div className="footer__group">
            <p className="footer__group-title t-label-m">Connect</p>
            <LinkList links={connectLinks} />
          </div>
        </nav>
      </div>

      <div className="footer__divider" aria-hidden />

      <div className="footer__bottom">
        <ul className="footer__legal t-body-xs">
          <li>© 2026 TinyFish</li>
          {legalLinks.map((l) => (
            <li key={l.label} className="footer__legal-item">
              <span aria-hidden>·</span>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <ul className="footer__social">
          {socials.map((s) => (
            <li key={s.file}>
              <a href="#" aria-label={s.label}>
                <span className="footer__social-icon" style={{ maskImage: `url(/assets/footer/${s.file}.svg)` }} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
