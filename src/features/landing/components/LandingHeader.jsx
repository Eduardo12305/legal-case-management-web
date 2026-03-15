import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import LandingAnchorLink from './LandingAnchorLink'

function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const syncScrollState = () => setIsScrolled(window.scrollY > 12)

    syncScrollState()
    window.addEventListener('scroll', syncScrollState, { passive: true })

    return () => window.removeEventListener('scroll', syncScrollState)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <header className={`landing-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="landing-shell landing-header-row">
        <LandingAnchorLink className="landing-brand" to="/#top" onClick={closeMenu}>
          <span className="landing-brand-mark">NJ</span>
          <span className="landing-brand-copy">
            <strong>Nexus Juridico</strong>
            <small>Advocacia estrategica</small>
          </span>
        </LandingAnchorLink>

        <button
          className={`landing-menu-toggle ${isMenuOpen ? 'is-open' : ''}`}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="landing-navigation"
          aria-label="Alternar menu"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>

        <div
          className={`landing-navigation ${isMenuOpen ? 'is-open' : ''}`}
          id="landing-navigation"
        >
          <nav className="landing-nav-links" aria-label="Navegacao institucional">
            <NavLink
              to="/sobre"
              className={({ isActive }) =>
                `landing-nav-link ${isActive ? 'is-active' : ''}`
              }
              onClick={closeMenu}
            >
              Sobre
            </NavLink>
            <NavLink
              to="/atuacao"
              className={({ isActive }) =>
                `landing-nav-link ${isActive ? 'is-active' : ''}`
              }
              onClick={closeMenu}
            >
              Atuacao
            </NavLink>
            <LandingAnchorLink className="landing-nav-link" to="/#como" onClick={closeMenu}>
              Como funciona
            </LandingAnchorLink>
            <LandingAnchorLink className="landing-nav-link" to="/#contato" onClick={closeMenu}>
              Contato
            </LandingAnchorLink>
          </nav>

          <div className="landing-header-actions">
            <Link
              className="landing-button primary"
              to="/login"
              onClick={closeMenu}
            >
              Acessar portal
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
