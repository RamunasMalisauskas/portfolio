import ArrowUpRight from "./ArrowUpRight";

function Hero() {
  return (
    <section className="hero wrap" id="top" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow hero__eyebrow">
          <span className="status-dot" />
          <span>RAMŪNAS MALIŠAUSKAS</span>

          <span className="eyebrow__divider">≡</span>
          <span>FRONT-END DEVELOPER / DESIGNER</span>
        </p>
        <h1 id="hero-title">
          I make your app
          <br />
          feel{" "}
          <span className="highlight-word">
            thoughtful<span className="highlight-word__dot">.</span>
          </span>
        </h1>
        <p className="hero__intro">
          I design and build clear, considered interfaces
          <br />
          with attention to detail, clarity, and the small decisions
          <br />
          that make an experience feel just right.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#work">
            Explore my work <span>↓</span>
          </a>
          <a className="text-link" href="#contact">
            Get in touch <ArrowUpRight />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
