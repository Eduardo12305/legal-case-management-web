import { Link, useLocation } from 'react-router-dom'

function LandingAnchorLink({ to, onClick, children, ...props }) {
  const location = useLocation()
  const [rawPath, rawHash] = to.split('#')
  const pathname = rawPath || location.pathname
  const hash = rawHash ? `#${rawHash}` : ''

  const handleClick = (event) => {
    onClick?.(event)

    if (event.defaultPrevented) {
      return
    }

    if (location.pathname === pathname && location.hash === hash && hash) {
      const target = document.getElementById(rawHash)

      if (target) {
        event.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

export default LandingAnchorLink
