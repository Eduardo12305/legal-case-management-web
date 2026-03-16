import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import authService from '../services/authService'
import { formatCpf, isCompleteCpf, normalizeCpf, CPF_MASK_LENGTH } from '../utils/forms'
import { getErrorMessage } from '../utils/helpers'
import { isClient } from '../utils/roles'

function ProfilePage() {
  const { user, role, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    document: isClient(role) ? formatCpf(user?.document || user?.cpf || '') : user?.document || '',
  })
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: '', success: '' })

    try {
      if (isClient(role)) {
        if (!isCompleteCpf(form.document)) {
          setStatus({ loading: false, error: 'Informe um CPF valido com 11 numeros.', success: '' })
          return
        }

        const normalizedCpf = normalizeCpf(form.document)

        await authService.updateClientProfile({
          ...form,
          document: normalizedCpf,
          cpf: normalizedCpf,
        })
      } else {
        await authService.updateProfile(form)
      }

      await refreshProfile()
      setStatus({ loading: false, error: '', success: 'Perfil atualizado com sucesso.' })
    } catch (error) {
      setStatus({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel atualizar o perfil agora.'),
        success: '',
      })
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
            {isClient(role) ? 'CPF' : 'Documento'}
            <input
              value={form.document}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  document: isClient(role)
                    ? formatCpf(event.target.value)
                    : event.target.value,
                }))
              }
              inputMode={isClient(role) ? 'numeric' : undefined}
              maxLength={isClient(role) ? CPF_MASK_LENGTH : undefined}
              placeholder={isClient(role) ? '000.000.000-00' : undefined}
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
