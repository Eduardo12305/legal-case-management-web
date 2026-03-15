import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import InfoGrid from '../components/InfoGrid'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import processService from '../services/processService'
import { asArray, getEntityId, getErrorMessage } from '../utils/helpers'
import {
  canCreateProcesses,
  canManageUsers,
  canViewProcessesMenu,
  isAdmin,
  isClient,
} from '../utils/roles'

function DashboardPage() {
  const { role, user } = useAuth()
  const processListPath = isClient(role) ? '/my-processes' : '/processes'
  const processShortcutLabel = isClient(role)
    ? 'Meus processos'
    : isAdmin(role)
      ? 'Pesquisar processos'
      : 'Consultar processos'
  const [summary, setSummary] = useState({
    loading: true,
    totalProcesses: 0,
    lastProcess: null,
    error: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const response = isClient(role)
          ? await processService.listMine()
          : await processService.listAll()
        const items = asArray(response)
        setSummary({
          loading: false,
          totalProcesses: items.length,
          lastProcess: items[0] || null,
          error: '',
        })
      } catch (error) {
        setSummary((current) => ({
          ...current,
          loading: false,
          error: getErrorMessage(error),
        }))
      }
    }

    load()
  }, [role])

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Dashboard"
        title={`Bem-vindo, ${user?.name || user?.email || 'usuario'}`}
        description="Visao rapida do ambiente com base nas permissoes ativas."
      />

      <InfoGrid
        items={[
          { label: 'Perfil', value: role || 'Nao informado' },
          {
            label: 'Processos visiveis',
            value: summary.loading ? '...' : summary.totalProcesses,
            helper: summary.error || 'Quantidade de processos disponiveis no momento.',
          },
          {
            label: 'Usuarios',
            value: canManageUsers(role) ? 'Liberado' : 'Bloqueado',
            helper: 'Disponibilidade conforme o perfil atual.',
          },
          {
            label: 'Edicao de processos',
            value: canCreateProcesses(role) ? 'Disponivel' : 'Somente consulta',
            helper: canViewProcessesMenu(role)
              ? 'A consulta segue as permissoes da sua conta.'
              : 'Acompanhe apenas os processos vinculados ao seu acesso.',
          },
        ]}
      />

      <div className="panel-grid">
        <article className="panel-card">
          <h4>Ultimo processo carregado</h4>
          <p className="muted">
            {summary.lastProcess
              ? `${summary.lastProcess.title || summary.lastProcess.subject || 'Sem titulo'}`
              : 'Nenhum processo disponivel.'}
          </p>
          {getEntityId(summary.lastProcess) ? (
            <Link className="text-link" to={`/processes/${getEntityId(summary.lastProcess)}`}>
              Abrir detalhes
            </Link>
          ) : null}
        </article>

        <article className="panel-card">
          <h4>Atalhos</h4>
          <div className="quick-actions">
            <Link className="secondary-button" to="/profile">
              Editar perfil
            </Link>
            <Link className="secondary-button" to={processListPath}>
              {processShortcutLabel}
            </Link>
            {canCreateProcesses(role) ? (
              <Link className="secondary-button" to="/processes/new">
                Novo processo
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  )
}

export default DashboardPage
