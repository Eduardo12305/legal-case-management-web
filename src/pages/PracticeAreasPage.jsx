import LandingLayout from '../features/landing/components/LandingLayout'
import PageHero from '../features/landing/components/PageHero'
import PracticeCatalogSection from '../features/landing/components/PracticeCatalogSection'
import RevealItem from '../features/landing/components/RevealItem'
import useDocumentTitle from '../features/landing/hooks/useDocumentTitle'

const focusItems = [
  'Contencioso com narrativa, ritmo e governanca.',
  'Consultivo empresarial com visao de decisao.',
  'Planejamento patrimonial com discricao operacional.',
]

function PracticeAreasPage() {
  useDocumentTitle('Atuacao | Nexus Juridico')

  return (
    <LandingLayout>
      <PageHero
        eyebrow="Areas de atuacao"
        title="Frentes juridicas desenhadas para alto nivel de exigencia."
        description="Nossa atuacao combina densidade tecnica, leitura de risco e uma comunicacao precisa para empresas, executivos e familias com questoes sensiveis."
        noteTitle="Foco de execucao"
        noteText="Estruturamos cada frente com interlocutores definidos, criterios de prioridade e acompanhamento continuo do caso."
        noteItems={focusItems}
      />

      <PracticeCatalogSection />

      <section className="landing-section">
        <div className="landing-shell">
          <RevealItem className="landing-cta-band" delay={80}>
            <div>
              <p className="landing-eyebrow">Proximo passo</p>
              <h2>Precisa alinhar uma demanda sensivel com rapidez?</h2>
              <p>
                Podemos apresentar a frente mais adequada e direcionar o acesso ao
                portal para continuidade do atendimento.
              </p>
            </div>
            <a className="landing-button primary" href="mailto:contato@nexusjuridico.com.br">
              Falar com o escritorio
            </a>
          </RevealItem>
        </div>
      </section>
    </LandingLayout>
  )
}

export default PracticeAreasPage
