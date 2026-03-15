import { useRef } from 'react'
import useReveal from '../hooks/useReveal'

function RevealItem({ as: Tag = 'div', className = '', delay = 0, children, ...props }) {
  const ref = useRef(null)
  const isVisible = useReveal(ref, delay)
  const classes = ['landing-reveal', isVisible ? 'is-visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={classes} {...props}>
      {children}
    </Tag>
  )
}

export default RevealItem
