import traits from "../data/traits.json";

function About() {
  return (
    <section
      className="about-section section"
      id="about"
      aria-labelledby="about-title"
    >
      <div className="about-section__inner">
        <div className="about-section__content">
          <h2 id="about-title">
            The details make the difference
            <span className="highlight-word__dot">.</span>
          </h2>
          <p>
            I’m a frontend developer based in Lithuania. I enjoy turning ideas
            into interfaces that feel simple to use, work for more people, and
            hold together on every screen.
          </p>
          <p className="about-section__language">
            <span className="language-mark">A↔Ą</span> I speak English and
            Lithuanian.
          </p>
          <div className="skills-block">
            <p className="eyebrow">TOOLS I REACH FOR</p>
            <ul className="skill-list">
              {traits.tools.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: "24px" }}>
            <p className="eyebrow">TRAITS I CARRY</p>
            <ul className="skill-list">
              {traits.traits.map((trait) => (
                <li key={trait}>{trait}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
