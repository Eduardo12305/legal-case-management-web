import { footerLinks } from '../data/content'
import LandingAnchorLink from './LandingAnchorLink'
import { Link } from 'react-router-dom'

function LandingFooter() {
  return (
    <footer className="landing-footer landing-anchor-section" id="contato">
      <div className="landing-shell landing-footer-row">
        <div>
          <div className="landing-footer-brand">Nexus Juridico</div>
          <p>Advocacia estrategica com operacao digital discreta e organizada.</p>
        </div>

        <div className="landing-footer-links">
          {footerLinks.map((link) => (
            link.to.includes('#') ? (
              <LandingAnchorLink key={link.to} to={link.to}>
                {link.label}
              </LandingAnchorLink>
            ) : (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            )
          ))}
        </div>

        <div className="landing-contact-list">
          <span>Av. Brigadeiro Faria Lima, Sao Paulo - SP</span>
          <a href="mailto:contato@nexusjuridico.com.br">contato@nexusjuridico.com.br</a>
          <a href="tel:+551140002040">+55 11 4000-2040</a>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
