import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const LOGIN_ERROR_MESSAGE =
  'Nao foi possivel concluir o acesso. Confira os dados informados e tente novamente.'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const result = await login(form)

      if (result?.requiresPasswordChange) {
        navigate('/change-password', {
          replace: true,
          state: { userId: result.userId, firstLogin: true, email: form.email },
        })
        return
      }

      navigate(from, { replace: true })
    } catch {
      setError(LOGIN_ERROR_MESSAGE)
    }
  }

  return (
    <div className="auth-page">
      <section className="hero-panel">
        <p className="eyebrow">Advon Client</p>
        <h1>Acesso institucional para clientes, equipe juridica e administracao</h1>
        <p>
          Entre no portal para acompanhar demandas, acessar atualizacoes importantes e
          manter a rotina juridica em um ambiente mais contemporaneo.
        </p>
        <div className="hero-bullets">
          <div>
            <strong>Painel organizado</strong>
            <span>Fluxo claro para consulta, acompanhamento e operacao diaria.</span>
          </div>
          <div>
            <strong>Experiencia mais atual</strong>
            <span>Visual institucional com mais profundidade e melhor hierarquia.</span>
          </div>
          <div>
            <strong>Acesso por perfil</strong>
            <span>Cada usuario enxerga o que faz sentido para sua funcao.</span>
          </div>
        </div>
      </section>

      <section className="form-panel login-panel">
        <div className="panel-intro">
          <p className="eyebrow">Area reservada</p>
          <h2>Entrar</h2>
          <p className="muted">
            Use seus dados de acesso para entrar na plataforma. Em caso de primeiro acesso,
            siga o fluxo de redefinicao solicitado pelo sistema.
          </p>
        </div>

        <h2>Entrar</h2>
        <form className="stack-form" onSubmit={handleSubmit} autoComplete="on">
          <label htmlFor="login-email">
            Email
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label htmlFor="login-password">
            Senha
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="login-footer">
          <p className="muted">O acesso e liberado internamente pela administracao da plataforma.</p>
          <Link className="text-link" to="/">
            Voltar para a pagina inicial
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
