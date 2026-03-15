import { Link } from 'react-router-dom'
import { practiceAreas } from '../data/content'
import AreaIcon from './AreaIcon'
import RevealItem from './RevealItem'

function PracticeOverviewSection() {
  return (
    <section className="landing-section landing-surface-section landing-anchor-section" id="atuacao">
      <div className="landing-shell">
        <RevealItem className="landing-section-heading" delay={30}>
          <p className="landing-eyebrow">Areas de atuacao</p>
          <h2>Frentes juridicas desenhadas para alto nivel de exigencia.</h2>
          <p>
            A estrutura abaixo resume os principais eixos de atendimento e ja
            prepara a leitura para a pagina completa de atuacao.
          </p>
        </RevealItem>

        <div className="landing-card-grid">
          {practiceAreas.map((area, index) => (
            <RevealItem key={area.id} className="landing-card" delay={60 + index * 70}>
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

        <RevealItem className="landing-section-link" delay={160}>
          <Link className="landing-button secondary" to="/atuacao">
            Ver detalhamento completo
          </Link>
        </RevealItem>
      </div>
    </section>
  )
}

export default PracticeOverviewSection
