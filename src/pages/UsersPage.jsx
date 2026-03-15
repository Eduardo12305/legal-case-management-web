import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import InfoGrid from '../components/InfoGrid'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import authService from '../services/authService'
import userService from '../services/userService'
import { asArray, getErrorMessage } from '../utils/helpers'
import { getCreatableRoles, isAdmin } from '../utils/roles'

function UsersPage() {
  const { role } = useAuth()
  const [view, setView] = useState('users')
  const [users, setUsers] = useState([])
  const [clients, setClients] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [filters, setFilters] = useState({ query: '', active: 'all' })
  const [status, setStatus] = useState({ loading: true, error: '', searchLoading: false })
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'CLIENT',
  })
  const [inviteStatus, setInviteStatus] = useState({ loading: false, error: '', success: '' })
  const creatableRoles = getCreatableRoles(role)

  const loadUsers = async () => {
    setStatus({ loading: true, error: '' })
    try {
      const result = await userService.list()
      setUsers(result?.users || [])
      setPagination({
        total: result?.total || 0,
        page: result?.page || 1,
        totalPages: result?.totalPages || 1,
      })
      setStatus({ loading: false, error: '', searchLoading: false })
    } catch (error) {
      setStatus({ loading: false, error: getErrorMessage(error), searchLoading: false })
    }
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await userService.list()
        setUsers(result?.users || [])
        setPagination({
          total: result?.total || 0,
          page: result?.page || 1,
          totalPages: result?.totalPages || 1,
        })
        setStatus({ loading: false, error: '', searchLoading: false })
      } catch (error) {
        setStatus({ loading: false, error: getErrorMessage(error), searchLoading: false })
      }
    }

    fetchUsers()
  }, [])

  const handleToggleActive = async (userId) => {
    try {
      await userService.toggleActive(userId)
      await loadUsers()
    } catch (error) {
      setStatus((current) => ({ ...current, loading: false, error: getErrorMessage(error) }))
    }
  }

  const handleGrantStaffPermissions = async (userId) => {
    try {
      await userService.updateStaffPermissions(userId, { canManageProcesses: true })
      await loadUsers()
    } catch (error) {
      setStatus((current) => ({ ...current, loading: false, error: getErrorMessage(error) }))
    }
  }

  const handleClientSearch = async (event) => {
    event.preventDefault()
    setStatus((current) => ({ ...current, searchLoading: true, error: '' }))

    try {
      const data = await userService.listClients(filters)
      setClients(asArray(data))
      setView('clients')
      setStatus((current) => ({ ...current, searchLoading: false, error: '' }))
    } catch (error) {
      setStatus((current) => ({
        ...current,
        searchLoading: false,
        error: getErrorMessage(error),
      }))
    }
  }

  const handleClientToggleActive = async (clientId) => {
    try {
      await userService.toggleClientActive(clientId)
      const data = await userService.listClients(filters)
      setClients(asArray(data))
    } catch (error) {
      setStatus((current) => ({ ...current, error: getErrorMessage(error) }))
    }
  }

  const handleCreateInvite = async (event) => {
    event.preventDefault()
    setInviteStatus({ loading: true, error: '', success: '' })

    try {
      await authService.createInvite(inviteForm)
      setInviteStatus({
        loading: false,
        error: '',
        success: 'Usuario cadastrado com sucesso e pronto para o proximo passo de acesso.',
      })
      setInviteForm({ name: '', email: '', cpf: '', role: 'CLIENT' })
      await loadUsers()
    } catch (error) {
      setInviteStatus({ loading: false, error: getErrorMessage(error), success: '' })
    }
  }

  const activeUsersCount = users.filter((user) => user.active !== false).length
  const inactiveUsersCount = users.filter((user) => user.active === false).length

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Usuarios"
        title="Gestao de usuarios"
        description="Visualize usuarios do sistema e busque clientes por CPF, nome, email ou telefone."
      />

      <InfoGrid
        items={[
          { label: 'Usuarios ativos', value: activeUsersCount },
          { label: 'Usuarios inativos', value: inactiveUsersCount },
          {
            label: 'Busca de clientes',
            value: clients.length,
            helper: 'Localize clientes por nome, CPF, email ou telefone.',
          },
          {
            label: 'Perfil atual',
            value: role,
            helper: 'Visao atual do ambiente.',
          },
          {
            label: 'Paginacao',
            value: `${pagination.page}/${pagination.totalPages}`,
            helper: `${pagination.total} usuarios disponiveis nesta consulta.`,
          },
        ]}
      />

      <article className="panel-card">
        <div className="toolbar-header">
          <div className="segmented-control">
            <button
              type="button"
              className={view === 'users' ? 'secondary-button is-active' : 'secondary-button'}
              onClick={() => setView('users')}
            >
              Usuarios
            </button>
            <button
              type="button"
              className={view === 'clients' ? 'secondary-button is-active' : 'secondary-button'}
              onClick={() => setView('clients')}
            >
              Buscar clientes
            </button>
          </div>

          <form className="search-grid" onSubmit={handleClientSearch}>
            <label className="full-span">
              Buscar cliente
              <input
                value={filters.query}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="Digite CPF, nome, email ou telefone"
              />
            </label>
            <label>
              Status
              <select
                value={filters.active}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, active: event.target.value }))
                }
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </label>
            <button type="submit" className="primary-button" disabled={status.searchLoading}>
              {status.searchLoading ? 'Buscando...' : 'Pesquisar'}
            </button>
          </form>
        </div>
      </article>

      {creatableRoles.length ? (
        <article className="panel-card">
          <div className="panel-split">
            <div>
              <p className="eyebrow">Criar usuario</p>
              <h4>Novo acesso para a equipe ou cliente</h4>
              <p className="muted">
                Cadastre novos acessos de forma interna para manter a operacao organizada e o
                relacionamento com clientes mais fluido.
              </p>
              <p className="muted">
                Informe os dados principais do usuario para liberar o acesso com mais rapidez.
              </p>
            </div>

            <form className="form-grid" onSubmit={handleCreateInvite}>
              <label>
                Nome
                <input
                  value={inviteForm.name}
                  onChange={(event) =>
                    setInviteForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) =>
                    setInviteForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                CPF
                <input
                  value={inviteForm.cpf}
                  onChange={(event) =>
                    setInviteForm((current) => ({ ...current, cpf: event.target.value }))
                  }
                  placeholder="Somente numeros ou formatado"
                  required
                />
              </label>
              <label>
                Perfil
                <select
                  value={inviteForm.role}
                  onChange={(event) =>
                    setInviteForm((current) => ({ ...current, role: event.target.value }))
                  }
                >
                  {creatableRoles.map((availableRole) => (
                    <option key={availableRole} value={availableRole}>
                      {availableRole}
                    </option>
                  ))}
                </select>
              </label>
              <div className="invite-actions full-span">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={inviteStatus.loading}
                >
                  {inviteStatus.loading ? 'Criando...' : 'Criar convite'}
                </button>
              </div>
              {inviteStatus.error ? <p className="form-error full-span">{inviteStatus.error}</p> : null}
              {inviteStatus.success ? (
                <p className="form-success full-span">{inviteStatus.success}</p>
              ) : null}
            </form>
          </div>
        </article>
      ) : null}

      {status.error ? <p className="form-error">{status.error}</p> : null}
      {status.loading ? <p className="muted">Carregando usuarios...</p> : null}

      {view === 'users' ? (
        <DataTable
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Perfil' },
            {
              key: 'active',
              label: 'Status',
              render: (user) => (
                <span className={user.active === false ? 'status-pill off' : 'status-pill on'}>
                  {user.active === false ? 'Inativo' : 'Ativo'}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Acoes',
              render: (user) => (
                <div className="row-actions">
                  <button
                    type="button"
                    className="table-button"
                    onClick={() => handleToggleActive(user.id)}
                  >
                    Alternar ativo
                  </button>
                  <button
                    type="button"
                    className="table-button"
                    onClick={() => handleGrantStaffPermissions(user.id)}
                  >
                    Ajustar permissoes
                  </button>
                </div>
              ),
            },
          ]}
          rows={users}
          emptyTitle="Nenhum usuario encontrado"
          emptyDescription="Nenhum usuario disponivel para exibicao."
        />
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'cpf', label: 'CPF' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Telefone' },
            {
              key: 'active',
              label: 'Status',
              render: (client) => (
                <span className={client.active === false ? 'status-pill off' : 'status-pill on'}>
                  {client.active === false ? 'Inativo' : 'Ativo'}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Acoes',
              render: (client) =>
                isAdmin(role) ? (
                  <button
                    type="button"
                    className="table-button"
                    onClick={() => handleClientToggleActive(client.id)}
                  >
                    Alternar ativo
                  </button>
                ) : (
                  <span className="muted">Indisponivel</span>
                ),
            },
          ]}
          rows={clients}
          emptyTitle="Nenhum cliente encontrado"
          emptyDescription="Pesquise por CPF, nome, email ou telefone para localizar o cliente certo."
        />
      )}
    </section>
  )
}

export default UsersPage
