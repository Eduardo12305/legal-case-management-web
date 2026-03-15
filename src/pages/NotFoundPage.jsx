import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="center-card">
      <p className="eyebrow">404</p>
      <h1>Pagina nao encontrada</h1>
      <p className="muted">A rota solicitada nao existe neste frontend.</p>
      <Link className="primary-button inline-flex" to="/dashboard">
        Voltar ao dashboard
      </Link>
    </div>
  )
}

export default NotFoundPage
