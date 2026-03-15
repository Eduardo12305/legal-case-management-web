import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import processService from '../services/processService'
import { asArray, getEntityId, getErrorMessage } from '../utils/helpers'

function MyProcessesPage() {
  const [processes, setProcesses] = useState([])
  const [status, setStatus] = useState({ loading: true, error: '' })

  useEffect(() => {
    async function load() {
      setStatus({ loading: true, error: '' })
      try {
        const data = await processService.listMine()
        const items = asArray(data)
        setProcesses(items)
        setStatus({ loading: false, error: '' })
      } catch (error) {
        setStatus({ loading: false, error: getErrorMessage(error) })
      }
    }

    load()
  }, [])

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Area do cliente"
        title="Meus processos"
        description="Acompanhe os processos vinculados ao seu atendimento em modo de consulta."
      />

      {status.error ? <p className="form-error">{status.error}</p> : null}
      {status.loading ? <p className="muted">Carregando processos...</p> : null}

      <DataTable
        columns={[
          {
            key: 'processNumber',
            label: 'Numero',
            render: (process) => process.processNumber || process.number || '-',
          },
          {
            key: 'title',
            label: 'Titulo',
            render: (process) => process.title || process.subject || '-',
          },
          { key: 'status', label: 'Status' },
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
        emptyTitle="Nenhum processo vinculado"
        emptyDescription="Nao ha processos disponiveis para exibicao no momento."
      />
    </section>
  )
}

export default MyProcessesPage
