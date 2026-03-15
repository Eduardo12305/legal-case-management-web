import LandingLayout from '../features/landing/components/LandingLayout'
import AboutHighlightsSection from '../features/landing/components/AboutHighlightsSection'
import PageHero from '../features/landing/components/PageHero'
import RevealItem from '../features/landing/components/RevealItem'
import useDocumentTitle from '../features/landing/hooks/useDocumentTitle'

const noteItems = [
  'Diagnostico claro antes de qualquer passo operacional.',
  'Relacao direta com quem lidera o caso.',
  'Atualizacoes organizadas, sem ruido desnecessario.',
]

function AboutPage() {
  useDocumentTitle('Sobre | Nexus Juridico')

  return (
    <LandingLayout>
      <PageHero
        eyebrow="Sobre a Nexus"
        title="Advocacia de alta confianca para momentos decisivos."
        description="A Nexus Juridico combina rigor tecnico, postura institucional refinada e uma operacao digital discreta para clientes que precisam de seguranca na tomada de decisao."
        noteTitle="Estrutura de atendimento"
        noteText="Cada caso nasce com leitura de risco, alinhamento de prioridade e um fluxo de comunicacao que privilegia contexto, clareza e previsibilidade."
        noteItems={noteItems}
      />

      <AboutHighlightsSection />

      <section className="landing-section">
        <div className="landing-shell landing-detail-grid">
          <RevealItem className="landing-detail-card" delay={60}>
            <p className="landing-eyebrow">Metodo</p>
            <h2>Presenca juridica sob medida para cenarios de alta sensibilidade.</h2>
            <p>
              Atuamos em disputas, movimentos societarios, blindagem patrimonial e
              temas consultivos que exigem densidade tecnica e relacao proxima com a
              lideranca do cliente.
            </p>
          </RevealItem>

          <RevealItem className="landing-quote-card" delay={140}>
            <p className="landing-eyebrow">Visao</p>
            <blockquote>
              "Tecnologia entra como suporte a uma experiencia juridica mais clara,
              nunca como excesso."
            </blockquote>
            <p>
              Por isso a vitrine institucional e o portal convivem no mesmo app
              React, sem paginas paralelas ou manutencao duplicada.
            </p>
          </RevealItem>
        </div>
      </section>
    </LandingLayout>
  )
}

export default AboutPage
