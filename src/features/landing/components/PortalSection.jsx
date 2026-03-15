import { Link } from 'react-router-dom'
import { portalBenefits } from '../data/content'
import RevealItem from './RevealItem'

function PortalSection() {
  return (
    <section className="landing-section landing-anchor-section" id="conheca-o-portal">
      <div className="landing-shell">
        <RevealItem className="landing-portal-panel" delay={40}>
          <div className="landing-portal-copy">
            <p className="landing-eyebrow">Conheca o portal</p>
            <h2>Veja como o portal organiza prazos, documentos e comunicacao.</h2>
            <p>
              Esta secao apresenta a experiencia do portal. O acesso de fato fica
              sempre no CTA de login, sem duplicidade nem ambiguidades entre
              navegar pela landing e entrar no sistema.
            </p>
          </div>

          <div>
            <ul className="landing-benefit-list">
              {portalBenefits.map((item) => (
                <li key={item} className="landing-benefit-item">
                  <span className="landing-bullet" aria-hidden="true" />
                  <span className="landing-benefit-copy">{item}</span>
                </li>
              ))}
            </ul>

            <div className="landing-hero-actions">
              <Link className="landing-button primary" to="/login">
                Acessar portal
              </Link>
              <a className="landing-button secondary" href="mailto:contato@nexusjuridico.com.br">
                Tirar duvidas
              </a>
            </div>
          </div>
        </RevealItem>
      </div>
    </section>
  )
}

export default PortalSection
