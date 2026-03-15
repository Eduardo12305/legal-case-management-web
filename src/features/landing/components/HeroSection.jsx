import { Link } from 'react-router-dom'
import LandingAnchorLink from './LandingAnchorLink'
import RevealItem from './RevealItem'

function HeroSection() {
  return (
    <section className="landing-hero landing-anchor-section" id="top">
      <div className="landing-hero-backdrop" aria-hidden="true" />
      <div className="landing-shell landing-hero-grid">
        <RevealItem className="landing-hero-copy" delay={20}>
          <p className="landing-eyebrow">Advocacia estrategica de alta confianca</p>
          <div className="landing-pill">
            Estrutura boutique em Sao Paulo para empresas, familias e liderancas
          </div>
          <h1 className="landing-hero-title">
            Decisoes juridicas com presenca, criterio e visao de longo prazo.
          </h1>
          <p className="landing-hero-text">
            A Nexus Juridico une densidade tecnica, atendimento proximo e uma
            experiencia institucional mais coerente: a vitrine, as paginas de
            apresentacao e o portal vivem no mesmo app React.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-button primary" to="/atuacao">
              Conheca nossa atuacao
            </Link>
            <LandingAnchorLink className="landing-button secondary" to="/#sobre">
              Explorar o escritorio
            </LandingAnchorLink>
          </div>
        </RevealItem>

        <RevealItem as="aside" className="landing-hero-panel" delay={140}>
          <div className="landing-panel-copy">
            <p className="landing-eyebrow">Atuacao coordenada</p>
            <strong>
              Contencioso, consultivo empresarial e patrimonio com acompanhamento
              continuo.
            </strong>
            <p>
              Equipe dedicada, relatorios objetivos e acesso ao portal real do
              cliente sem camadas paralelas de manutencao.
            </p>
          </div>

          <div className="landing-stat-grid">
            <article className="landing-stat-card">
              <strong>24h</strong>
              <span>para resposta inicial em demandas prioritarias</span>
            </article>
            <article className="landing-stat-card">
              <strong>360</strong>
              <span>visao integrada entre estrategia juridica e risco reputacional</span>
            </article>
            <article className="landing-stat-card">
              <strong>1 app</strong>
              <span>institucional e portal alinhados na mesma base React</span>
            </article>
          </div>
        </RevealItem>
      </div>
    </section>
  )
}

export default HeroSection
