import { aboutHighlights } from '../data/content'
import RevealItem from './RevealItem'

function AboutHighlightsSection() {
  return (
    <section className="landing-section">
      <div className="landing-shell landing-editorial-grid">
        {aboutHighlights.map((item, index) => (
          <RevealItem key={item.title} className="landing-editorial-card" delay={50 + index * 80}>
            <p className="landing-eyebrow">{item.title}</p>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </RevealItem>
        ))}
      </div>
    </section>
  )
}

export default AboutHighlightsSection
