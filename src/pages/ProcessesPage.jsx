import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import processService from '../services/processService'
import userService from '../services/userService'
import { asArray, getEntityId, getErrorMessage } from '../utils/helpers'
import { canCreateProcesses, canSearchProcessesByClient, isAdmin } from '../utils/roles'

function ProcessesPage() {
  const { role } = useAuth()
  const adminView = isAdmin(role)
  const canSearchByClient = canSearchProcessesByClient(role)
  const [processes, setProcesses] = useState([])
  const [clientSearch, setClientSearch] = useState('')
  const [clientOptions, setClientOptions] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [status, setStatus] = useState({ loading: true, error: '' })
  const [clientStatus, setClientStatus] = useState({ loading: false, error: '' })

  const loadProcesses = useCallback(async (clientId) => {
    setStatus({ loading: true, error: '' })
    try {
      const data = clientId ? await processService.listByClient(clientId) : await processService.listAll()
      setProcesses(asArray(data))
      setStatus({ loading: false, error: '' })
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error) })
    }
  }, [])

  useEffect(() => {
    loadProcesses()
  }, [loadProcesses])

  const handleClientSearch = async (event) => {
    event.preventDefault()
    setClientStatus({ loading: true, error: '' })

    try {
      const data = await userService.listClients({ query: clientSearch, active: 'all' })
      setClientOptions(asArray(data))
      setClientStatus({ loading: false, error: '' })
    } catch (error) {
      setClientStatus({ loading: false, error: getErrorMessage(error) })
      setClientOptions([])
    }
  }

  const handleSelectClient = async (client) => {
    const clientId = getEntityId(client)
    setSelectedClient(client)
    await loadProcesses(clientId)
  }

  const handleClearFilter = async () => {
    setSelectedClient(null)
    setClientOptions([])
    setClientSearch('')
    await loadProcesses()
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Processos"
        title={adminView ? 'Consulta e pesquisa geral' : 'Processos sob sua responsabilidade'}
        description={
          adminView
            ? 'Pesquise por cliente e abra os processos em modo de consulta.'
            : 'Acompanhe seus processos e filtre por cliente para localizar um caso com mais rapidez.'
        }
        action={
          canCreateProcesses(role) ? (
            <Link className="secondary-button" to="/processes/new">
              Novo processo
            </Link>
          ) : null
        }
      />

      {canSearchByClient ? (
        <article className="panel-card">
          <div className="toolbar-header">
            <form className="search-grid" onSubmit={handleClientSearch}>
              <label className="full-span">
                Buscar cliente
                <input
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  placeholder="Digite CPF, nome, email ou telefone"
                />
              </label>
              <button type="submit" className="secondary-button" disabled={clientStatus.loading}>
                {clientStatus.loading ? 'Buscando...' : 'Buscar cliente'}
              </button>
              {selectedClient ? (
                <button type="button" className="table-button" onClick={handleClearFilter}>
                  Limpar filtro
                </button>
              ) : null}
            </form>

            {clientStatus.error ? <p className="form-error">{clientStatus.error}</p> : null}

            {selectedClient ? (
              <div className="selected-client">
                <strong>{selectedClient.name || 'Cliente selecionado'}</strong>
                <span>{selectedClient.cpf || 'CPF nao informado'}</span>
                <span>{selectedClient.email || 'Email nao informado'}</span>
              </div>
            ) : null}

            {clientOptions.length ? (
              <div className="client-results">
                {clientOptions.map((client) => (
                  <button
                    key={getEntityId(client)}
                    type="button"
                    className={`client-option ${
                      getEntityId(selectedClient) === getEntityId(client) ? 'active' : ''
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <strong>{client.name || 'Cliente sem nome'}</strong>
                    <span>{client.cpf || 'CPF nao informado'}</span>
                    <small>{client.email || client.phone || 'Sem contato cadastrado'}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ) : null}

      {status.error ? <p className="form-error">{status.error}</p> : null}
      {status.loading ? <p className="muted">Carregando processos...</p> : null}

      <DataTable
        columns={[
          { key: 'number', label: 'Numero' },
          { key: 'title', label: 'Titulo' },
          { key: 'status', label: 'Status' },
          { key: 'clientName', label: 'Cliente' },
          {
            key: 'details',
            label: 'Detalhes',
            render: (process) => (
              <Link className="text-link" to={`/processes/${getEntityId(process)}`}>
                Abrir
              </Link>
            ),
          },
        ]}
        rows={processes}
        emptyTitle="Nenhum processo encontrado"
        emptyDescription="Ajuste os filtros ou tente novamente mais tarde."
      />
    </section>
  )
}

export default ProcessesPage
