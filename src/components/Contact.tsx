import site from "../data/site.json";
import ArrowUpRight from "./ArrowUpRight";

function Contact() {
  const contactLinks = [
    site.email
      ? {
          label: "Email",
          href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(site.email)}`,
        }
      : null,
    site.githubUrl ? { label: "GitHub", href: site.githubUrl } : null,
    site.linkedinUrl ? { label: "LinkedIn", href: site.linkedinUrl } : null,
  ].filter((link): link is { label: string; href: string } => link !== null);

  return (
    <section
      className="contact-section section wrap"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-section__body">
        <h2 id="contact-title">
          Something good starts with{" "}
          <span className="highlight-word">
            hello<span className="highlight-word__dot">.</span>
          </span>
        </h2>
        <div className="contact-section__aside">
          <p>
            Have an idea, a question, or a frontend challenge? I’d be glad to
            hear from you.
          </p>
          <ul className="contact-links">
            {contactLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                  <ArrowUpRight />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer className="site-footer">
        <p className="eyebrow hero__eyebrow">
          <span className="status-dot" /> Made with care in Lithuania
        </p>

        <a className="back-top" href="#top">
          BACK TO TOP ↑
        </a>
      </footer>
    </section>
  );
}

export default Contact;
