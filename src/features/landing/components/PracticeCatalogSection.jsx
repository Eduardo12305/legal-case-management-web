import { practiceAreas } from '../data/content'
import AreaIcon from './AreaIcon'
import RevealItem from './RevealItem'

function PracticeCatalogSection() {
  return (
    <section className="landing-section landing-surface-section">
      <div className="landing-shell">
        <div className="landing-card-grid catalog">
          {practiceAreas.map((area, index) => (
            <RevealItem key={area.id} className="landing-card catalog" delay={40 + index * 70}>
              <div className="landing-card-meta">
                <span>{area.id}</span>
                <div className="landing-icon-badge">
                  <AreaIcon paths={area.iconPaths} />
                </div>
              </div>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
              <div className="landing-tag-list">
                {area.highlights.map((highlight) => (
                  <span key={highlight} className="landing-tag">
                    {highlight}
                  </span>
                ))}
              </div>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PracticeCatalogSection
