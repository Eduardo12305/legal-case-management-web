import { journeySteps } from '../data/content'
import RevealItem from './RevealItem'

function JourneySection() {
  return (
    <section className="landing-section landing-anchor-section" id="como">
      <div className="landing-shell">
        <RevealItem className="landing-section-heading" delay={30}>
          <p className="landing-eyebrow">Como funciona</p>
          <h2>Jornada objetiva, reservada e desenhada para gerar confianca.</h2>
          <p>
            O mesmo cuidado aplicado na estrategia do caso orienta a forma como a
            informacao e distribuida dentro do produto.
          </p>
        </RevealItem>

        <div className="landing-timeline">
          {journeySteps.map((step, index) => (
            <RevealItem key={step.id} as="article" className="landing-step" delay={70 + index * 90}>
              <span className="landing-step-number">{step.id}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  )
}

export default JourneySection
