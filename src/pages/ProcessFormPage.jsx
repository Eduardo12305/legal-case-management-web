import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import processService from '../services/processService'
import userService from '../services/userService'
import { formatCpf, isCompleteCpf, normalizeCpf, CPF_MASK_LENGTH } from '../utils/forms'
import { asArray, getEntityId, getErrorMessage } from '../utils/helpers'
import { buildProcessPayload, PROCESS_STATUS_OPTIONS } from '../utils/processes'

function ProcessFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    processNumber: '',
    title: '',
    status: 'ACTIVE',
    clientId: '',
    description: '',
    court: '',
    instance: '',
    subject: '',
    value: '',
  })
  const [clientSearch, setClientSearch] = useState('')
  const [clientOptions, setClientOptions] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })
  const [clientStatus, setClientStatus] = useState({ loading: false, error: '' })

  const handleClientSearch = async (event) => {
    event.preventDefault()
    setClientStatus({ loading: true, error: '' })

    try {
      if (!isCompleteCpf(clientSearch)) {
        setClientStatus({ loading: false, error: 'Informe um CPF valido com 11 numeros.' })
        setClientOptions([])
        return
      }

      const data = await userService.listClients({
        query: normalizeCpf(clientSearch),
        active: 'active',
      })
      const items = asArray(data)
      setClientOptions(items)
      setSelectedClient(null)
      setForm((current) => ({ ...current, clientId: '' }))
      setClientStatus({ loading: false, error: '' })
    } catch (error) {
      setClientStatus({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel localizar o cliente informado.'),
      })
      setClientOptions([])
    }
  }

  const handleSelectClient = (client) => {
    const clientId = getEntityId(client)
    setSelectedClient(client)
    setClientOptions([])
    setForm((current) => ({ ...current, clientId }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: '', success: '' })

    try {
      const payload = {
        ...buildProcessPayload(form),
        clientId: form.clientId,
        status: form.status || undefined,
      }

      const created = await processService.create(payload)
      setStatus({
        loading: false,
        error: '',
        success: 'Processo criado com sucesso. Redirecionando...',
      })

      const createdId = created?.id || created?.processId

      setTimeout(() => {
        if (createdId) {
          navigate(`/processes/${createdId}`, { replace: true })
          return
        }

        navigate('/processes', { replace: true })
      }, 700)
    } catch (error) {
      setStatus({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel cadastrar o processo agora.'),
        success: '',
      })
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Novo processo"
        title="Criacao de processo"
        description="Preencha os dados do processo e vincule o cliente correspondente."
      />

      <article className="panel-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Numero do processo
            <input
              value={form.processNumber}
              onChange={(event) =>
                setForm((current) => ({ ...current, processNumber: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Titulo
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Status inicial
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              {PROCESS_STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </label>
          <div className="full-span panel-card nested-card">
            <div className="section-inline-header">
              <div>
                <p className="eyebrow">Cliente</p>
                <h4>Localizar por CPF</h4>
              </div>
              {selectedClient ? (
                <span className="status-pill on">Selecionado</span>
              ) : (
                <span className="status-pill off">Nao selecionado</span>
              )}
            </div>

            <div className="search-grid">
              <label className="full-span">
                CPF do cliente
                <input
                  value={clientSearch}
                  onChange={(event) => setClientSearch(formatCpf(event.target.value))}
                  inputMode="numeric"
                  maxLength={CPF_MASK_LENGTH}
                  placeholder="000.000.000-00"
                />
              </label>
              <button
                type="button"
                className="secondary-button"
                disabled={clientStatus.loading}
                onClick={handleClientSearch}
              >
                {clientStatus.loading ? 'Buscando...' : 'Buscar cliente'}
              </button>
            </div>

            {clientStatus.error ? <p className="form-error compact-top">{clientStatus.error}</p> : null}

            {selectedClient ? (
              <div className="selected-client compact-top">
                <strong>{selectedClient.name || 'Cliente selecionado'}</strong>
                <span>{formatCpf(selectedClient.cpf) || 'CPF nao informado'}</span>
                <span>{selectedClient.email || 'Email nao informado'}</span>
              </div>
            ) : null}

            {clientOptions.length ? (
              <div className="client-results compact-top">
                {clientOptions.map((client) => (
                  <button
                    key={getEntityId(client)}
                    type="button"
                    className={`client-option ${
                      form.clientId === getEntityId(client) ? 'active' : ''
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <strong>{client.name || 'Cliente sem nome'}</strong>
                    <span>{formatCpf(client.cpf) || 'CPF nao informado'}</span>
                    <small>{client.email || client.phone || 'Sem contato cadastrado'}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <label className="full-span">
            Descricao
            <textarea
              rows="5"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
          <label>
            Tribunal
            <input
              value={form.court}
              onChange={(event) => setForm((current) => ({ ...current, court: event.target.value }))}
            />
          </label>
          <label>
            Instancia
            <input
              value={form.instance}
              onChange={(event) =>
                setForm((current) => ({ ...current, instance: event.target.value }))
              }
            />
          </label>
          <label>
            Assunto
            <input
              value={form.subject}
              onChange={(event) =>
                setForm((current) => ({ ...current, subject: event.target.value }))
              }
            />
          </label>
          <label>
            Valor
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
            />
          </label>
          {status.error ? <p className="form-error full-span">{status.error}</p> : null}
          {status.success ? <p className="form-success full-span">{status.success}</p> : null}
          <button
            type="submit"
            className="primary-button"
            disabled={status.loading || !form.clientId || !form.processNumber || !form.title}
          >
            {status.loading ? 'Salvando...' : 'Criar processo'}
          </button>
        </form>
      </article>
    </section>
  )
}

export default ProcessFormPage
