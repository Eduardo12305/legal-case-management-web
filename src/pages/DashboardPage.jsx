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
  canSearchProcessesByClient,
  canViewProcessesMenu,
  isAdmin,
  isClient,
} from '../utils/roles'

function DashboardPage() {
  const { role, user } = useAuth()
  const hasProcessAccess = isClient(role) || canViewProcessesMenu(role)
  const processListPath = isClient(role) ? '/my-processes' : '/processes'
  const processShortcutLabel = isClient(role)
    ? 'Meus processos'
    : isAdmin(role)
      ? 'Pesquisar processos'
      : 'Consultar processos'
  const mainFlowLabel = isClient(role)
    ? 'Acompanhamento de processos'
    : canCreateProcesses(role)
      ? 'Operacao de processos'
      : canManageUsers(role)
        ? 'Consulta e administracao'
        : 'Atendimento interno'
  const shortcutsCount =
    2 +
    (hasProcessAccess ? 1 : 0) +
    (canManageUsers(role) ? 1 : 0) +
    (canCreateProcesses(role) ? 1 : 0)
  const [summary, setSummary] = useState({
    loading: true,
    totalProcesses: 0,
    lastProcess: null,
    error: '',
  })

  useEffect(() => {
    async function load() {
      if (!hasProcessAccess) {
        setSummary({
          loading: false,
          totalProcesses: 0,
          lastProcess: null,
          error: '',
        })
        return
      }

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
          error: getErrorMessage(error, 'Nao foi possivel atualizar o resumo de processos agora.'),
        }))
      }
    }

    load()
  }, [hasProcessAccess, role])

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
            value: hasProcessAccess ? (summary.loading ? '...' : summary.totalProcesses) : '-',
            helper: hasProcessAccess
              ? summary.error || 'Quantidade de processos disponiveis no momento.'
              : 'Esse indicador aparece quando sua conta tem acesso a processos.',
          },
          {
            label: 'Fluxo principal',
            value: mainFlowLabel,
            helper: canSearchProcessesByClient(role)
              ? 'Sua conta pode consultar clientes e processos conforme as permissoes ativas.'
              : 'Sua conta fica focada em acompanhamento, perfil e comunicacao.',
          },
          {
            label: 'Atalhos disponiveis',
            value: shortcutsCount,
            helper: 'Os acessos do painel acompanham o seu nivel de permissao.',
          },
        ]}
      />

      <div className="panel-grid">
        <article className="panel-card">
          <h4>Ultimo processo carregado</h4>
          <p className="muted">
            {hasProcessAccess && summary.lastProcess
              ? `${summary.lastProcess.title || summary.lastProcess.subject || 'Sem titulo'}`
              : hasProcessAccess
                ? 'Nenhum processo disponivel.'
                : 'Seu painel atual concentra comunicacao e dados da conta.'}
          </p>
          {hasProcessAccess && getEntityId(summary.lastProcess) ? (
            <Link className="text-link" to={`/processes/${getEntityId(summary.lastProcess)}`}>
              Abrir detalhes
            </Link>
          ) : null}
        </article>

        <article className="panel-card">
          <h4>Atalhos</h4>
          <div className="quick-actions">
            <Link className="secondary-button" to="/chat">
              Abrir chat
            </Link>
            <Link className="secondary-button" to="/profile">
              Editar perfil
            </Link>
            {hasProcessAccess ? (
              <Link className="secondary-button" to={processListPath}>
                {processShortcutLabel}
              </Link>
            ) : null}
            {canManageUsers(role) ? (
              <Link className="secondary-button" to="/users">
                Usuarios
              </Link>
            ) : null}
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
