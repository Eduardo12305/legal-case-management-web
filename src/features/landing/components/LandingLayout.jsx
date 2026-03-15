import LandingFooter from './LandingFooter'
import LandingHeader from './LandingHeader'

function LandingLayout({ children }) {
  return (
    <div className="landing-site">
      <LandingHeader />
      <main className="landing-main">{children}</main>
      <LandingFooter />
    </div>
  )
}

export default LandingLayout
