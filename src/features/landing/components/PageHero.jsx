import RevealItem from './RevealItem'

function PageHero({ eyebrow, title, description, noteTitle, noteText, noteItems = [] }) {
  return (
    <section className="landing-page-hero">
      <div className="landing-shell landing-page-hero-grid">
        <RevealItem className="landing-page-copy" delay={20}>
          <p className="landing-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </RevealItem>

        <RevealItem className="landing-page-note" delay={120}>
          <p className="landing-eyebrow">{noteTitle}</p>
          <p>{noteText}</p>
          {noteItems.length ? (
            <ul className="landing-benefit-list compact">
              {noteItems.map((item) => (
                <li key={item} className="landing-benefit-item">
                  <span className="landing-bullet" aria-hidden="true" />
                  <span className="landing-benefit-copy">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </RevealItem>
      </div>
    </section>
  )
}

export default PageHero
