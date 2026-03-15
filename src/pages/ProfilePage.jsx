import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import authService from '../services/authService'
import { getErrorMessage } from '../utils/helpers'
import { isClient } from '../utils/roles'

function ProfilePage() {
  const { user, role, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    document: user?.document || user?.cpf || '',
  })
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: '', success: '' })

    try {
      if (isClient(role)) {
        await authService.updateClientProfile(form)
      } else {
        await authService.updateProfile(form)
      }

      await refreshProfile()
      setStatus({ loading: false, error: '', success: 'Perfil atualizado com sucesso.' })
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error), success: '' })
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Perfil"
        title="Dados do usuario"
        description="Atualize seus dados de contato e identificacao."
      />

      <article className="panel-card narrow">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            Telefone
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>
          <label>
            Documento
            <input
              value={form.document}
              onChange={(event) =>
                setForm((current) => ({ ...current, document: event.target.value }))
              }
            />
          </label>
          {status.error ? <p className="form-error">{status.error}</p> : null}
          {status.success ? <p className="form-success">{status.success}</p> : null}
          <button type="submit" className="primary-button" disabled={status.loading}>
            {status.loading ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      </article>
    </section>
  )
}

export default ProfilePage
