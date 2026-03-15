import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import { getErrorMessage } from '../utils/helpers'

function ChangePasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { changePassword, pendingPasswordChange, isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    userId: location.state?.userId || pendingPasswordChange?.userId || '',
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

    setStatus({ loading: true, error: '', success: '' })

    try {
      await changePassword({
        userId: form.userId || undefined,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword,
      })

      setStatus({ loading: false, error: '', success: 'Senha alterada com sucesso.' })
      setTimeout(() => navigate(isAuthenticated ? '/dashboard' : '/login'), 900)
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error), success: '' })
    }
  }

  return (
    <section className="page-section single-page">
      <PageHeader
        eyebrow="Primeiro login"
        title="Alterar senha"
        description="Defina uma nova senha para continuar o acesso com seguranca."
      />

      <article className="panel-card narrow">
        <form className="stack-form" onSubmit={handleSubmit} autoComplete="on">
          <label htmlFor="change-password-user-id">
            Identificador
            <input
              id="change-password-user-id"
              name="userId"
              autoComplete="off"
              value={form.userId}
              onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
              placeholder="Preencha apenas se necessario"
            />
          </label>
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
          <label htmlFor="change-password-new">
            Nova senha
            <input
              id="change-password-new"
              name="newPassword"
              type="password"
              autoComplete="new-password"
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
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              required
            />
          </label>
          {status.error ? <p className="form-error">{status.error}</p> : null}
          {status.success ? <p className="form-success">{status.success}</p> : null}
          <button type="submit" className="primary-button" disabled={status.loading}>
            {status.loading ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </form>
        {!isAuthenticated ? (
          <p className="muted">
            Apos concluir, volte para <Link to="/login">login</Link>.
          </p>
        ) : null}
      </article>
    </section>
  )
}

export default ChangePasswordPage
