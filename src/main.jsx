import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Routes'
import './styles/app.css'
import './styles/landing.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
