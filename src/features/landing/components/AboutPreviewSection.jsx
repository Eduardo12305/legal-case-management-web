import { Link } from 'react-router-dom'
import RevealItem from './RevealItem'

function AboutPreviewSection() {
  return (
    <section className="landing-section landing-anchor-section" id="sobre">
      <div className="landing-shell landing-about-grid">
        <RevealItem className="landing-section-copy" delay={30}>
          <p className="landing-eyebrow">Sobre a Nexus</p>
          <h2>Precisao juridica com linguagem clara para momentos complexos.</h2>
          <p>
            Nossa pratica foi desenhada para clientes que valorizam interpretacao
            sofisticada, discricao operacional e relacao proxima com o escritorio.
          </p>
          <p>
            A experiencia institucional foi reorganizada para eliminar paginas
            estaticas soltas, manter a manutencao centralizada e deixar a navegacao
            mais confiavel.
          </p>
          <Link className="landing-button secondary dark" to="/sobre">
            Ver a pagina completa
          </Link>
        </RevealItem>

        <RevealItem className="landing-visual-stack" delay={110}>
          <div className="landing-visual-card accent" />
          <div className="landing-visual-card outline" />
          <div className="landing-visual-card solid" />
          <div className="landing-monogram">NJ</div>
          <div className="landing-annotation">Luxury legal advisory</div>
        </RevealItem>
      </div>
    </section>
  )
}

export default AboutPreviewSection
