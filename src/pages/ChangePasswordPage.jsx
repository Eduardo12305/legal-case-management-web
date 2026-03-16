import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import { getErrorMessage } from '../utils/helpers'
import { MIN_PASSWORD_LENGTH } from '../utils/forms'

function ChangePasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { changePassword, pendingPasswordChange, isAuthenticated } = useAuth()
  const isFirstAccess = Boolean(location.state?.firstLogin || pendingPasswordChange?.firstLogin)
  const [form, setForm] = useState({
    login: location.state?.email || pendingPasswordChange?.login || pendingPasswordChange?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ loading: false, error: 'As senhas nao conferem.', success: '' })
      return
    }

    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      setStatus({
        loading: false,
        error: `A nova senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        success: '',
      })
      return
    }

    setStatus({ loading: true, error: '', success: '' })

    try {
      await changePassword({
        login: isFirstAccess ? form.login || undefined : undefined,
        currentPassword: isFirstAccess ? undefined : form.currentPassword || undefined,
        newPassword: form.newPassword,
      })

      setStatus({ loading: false, error: '', success: 'Senha alterada com sucesso.' })
      setTimeout(() => navigate(isFirstAccess || isAuthenticated ? '/dashboard' : '/login'), 900)
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error), success: '' })
    }
  }

  return (
    <section className="page-section single-page">
      <PageHeader
        eyebrow={isFirstAccess ? 'Primeiro login' : 'Seguranca'}
        title="Alterar senha"
        description={
          isFirstAccess
            ? 'Defina uma nova senha para concluir seu primeiro acesso com seguranca.'
            : 'Atualize sua senha para continuar acessando a plataforma com seguranca.'
        }
      />

      <article className="panel-card narrow">
        <form className="stack-form" onSubmit={handleSubmit} autoComplete="on">
          {isFirstAccess ? (
            <label htmlFor="change-password-login">
              Login
              <input
                id="change-password-login"
                name="login"
                type="email"
                autoComplete="username"
                inputMode="email"
                value={form.login}
                onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))}
                required
              />
            </label>
          ) : null}
          {!isFirstAccess ? (
            <label htmlFor="change-password-current">
              Senha atual
              <input
                id="change-password-current"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(event) =>
                  setForm((current) => ({ ...current, currentPassword: event.target.value }))
                }
              />
            </label>
          ) : null}
          <label htmlFor="change-password-new">
            Nova senha
            <input
              id="change-password-new"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              value={form.newPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, newPassword: event.target.value }))
              }
              required
            />
          </label>
          <label htmlFor="change-password-confirm">
            Confirmar nova senha
            <input
              id="change-password-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              required
            />
          </label>
          <p className="muted">A nova senha precisa ter no minimo 8 caracteres.</p>
          {status.error ? <p className="form-error">{status.error}</p> : null}
          {status.success ? <p className="form-success">{status.success}</p> : null}
          <button type="submit" className="primary-button" disabled={status.loading}>
            {status.loading ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </form>
        {!isAuthenticated && !isFirstAccess ? (
          <p className="muted">
            Apos concluir, volte para <Link to="/login">login</Link>.
          </p>
        ) : null}
      </article>
    </section>
  )
}

export default ChangePasswordPage
