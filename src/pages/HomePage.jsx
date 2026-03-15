import LandingLayout from '../features/landing/components/LandingLayout'
import AboutPreviewSection from '../features/landing/components/AboutPreviewSection'
import HeroSection from '../features/landing/components/HeroSection'
import JourneySection from '../features/landing/components/JourneySection'
import PortalSection from '../features/landing/components/PortalSection'
import PracticeOverviewSection from '../features/landing/components/PracticeOverviewSection'
import useDocumentTitle from '../features/landing/hooks/useDocumentTitle'

function HomePage() {
  useDocumentTitle('Nexus Juridico')

  return (
    <LandingLayout>
      <HeroSection />
      <AboutPreviewSection />
      <PracticeOverviewSection />
      <JourneySection />
      <PortalSection />
    </LandingLayout>
  )
}

export default HomePage
