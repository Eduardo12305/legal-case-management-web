import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import processService from '../services/processService'
import { getEntityId, getErrorMessage } from '../utils/helpers'
import {
  buildProcessPayload,
  createProcessFormState,
  PROCESS_STATUS_OPTIONS,
} from '../utils/processes'
import { canEditProcessContent, isClient } from '../utils/roles'

const MAX_DOCUMENT_SIZE_BYTES = 3 * 1024 * 1024

function getDisplayValue(value) {
  if (value === 0) {
    return '0'
  }

  return value || '-'
}

function getDocumentName(document, index) {
  return (
    document?.name ||
    document?.filename ||
    document?.originalName ||
    document?.title ||
    `Documento ${index + 1}`
  )
}

function getDocumentUrl(document) {
  return document?.url || document?.fileUrl || document?.link || document?.path || ''
}

function getUpdateText(update, index) {
  return (
    update?.description ||
    update?.content ||
    update?.text ||
    `Andamento ${index + 1}`
  )
}

function getStatusTone(status) {
  if (['ACTIVE', 'WON'].includes(status)) {
    return 'on'
  }

  if (['ARCHIVED', 'SUSPENDED', 'CLOSED', 'LOST'].includes(status)) {
    return 'off'
  }

  return 'neutral'
}

function ProcessDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { role } = useAuth()
  const backPath = isClient(role) ? '/my-processes' : '/processes'
  const documentInputRef = useRef(null)
  const [process, setProcess] = useState(null)
  const [processForm, setProcessForm] = useState(() => createProcessFormState())
  const [documentForm, setDocumentForm] = useState({ name: '', file: null })
  const [updateForm, setUpdateForm] = useState({ description: '' })
  const [viewState, setViewState] = useState({ loading: true, error: '', success: '' })
  const [busyState, setBusyState] = useState({
    saving: false,
    uploadingDocument: false,
    addingUpdate: false,
  })
  const [isEditing, setIsEditing] = useState(false)

  const loadProcess = useCallback(
    async ({ preserveSuccess = false } = {}) => {
      setViewState((current) => ({
        loading: true,
        error: '',
        success: preserveSuccess ? current.success : '',
      }))

      try {
        const data = await processService.getById(id)
        setProcess(data)
        setProcessForm(createProcessFormState(data))
        setViewState((current) => ({
          loading: false,
          error: '',
          success: preserveSuccess ? current.success : '',
        }))
      } catch (error) {
        setViewState({
          loading: false,
          error: getErrorMessage(error, 'Nao foi possivel carregar os detalhes do processo.'),
          success: '',
        })
      }
    },
    [id],
  )

  useEffect(() => {
    loadProcess()
  }, [loadProcess])

  const documents = useMemo(
    () => (Array.isArray(process?.documents) ? process.documents : []),
    [process?.documents],
  )
  const updates = useMemo(
    () => (Array.isArray(process?.updates) ? process.updates : []),
    [process?.updates],
  )
  const canEditProcess = canEditProcessContent(role)

  const processFields = [
    { label: 'Numero do processo', value: process?.processNumber || process?.number },
    { label: 'Titulo', value: process?.title },
    { label: 'Status', value: process?.status },
    { label: 'Tribunal', value: process?.court },
    { label: 'Instancia', value: process?.instance },
    { label: 'Assunto', value: process?.subject },
    { label: 'Valor', value: process?.value },
    { label: 'Cliente', value: process?.clientName || process?.client?.name },
  ]

  const resetEditMode = () => {
    setProcessForm(createProcessFormState(process))
    setIsEditing(false)
    setViewState((current) => ({ ...current, error: '' }))
  }

  const handleProcessFieldChange = (field) => (event) => {
    setProcessForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleStartEditing = () => {
    setProcessForm(createProcessFormState(process))
    setViewState((current) => ({ ...current, error: '', success: '' }))
    setIsEditing(true)
  }

  const handleSaveProcess = async (event) => {
    event.preventDefault()

    if (!processForm.processNumber.trim() || !processForm.title.trim()) {
      setViewState({
        loading: false,
        error: 'Preencha ao menos o numero e o titulo do processo.',
        success: '',
      })
      return
    }

    setBusyState((current) => ({ ...current, saving: true }))
    setViewState((current) => ({ ...current, error: '', success: '' }))

    try {
      const payload = buildProcessPayload(processForm)
      const updatedProcess = await processService.update(id, payload)
      let nextProcess =
        updatedProcess && typeof updatedProcess === 'object'
          ? { ...process, ...updatedProcess }
          : {
              ...process,
              ...payload,
              processNumber: payload.processNumber,
              number: payload.processNumber,
            }

      if ((process?.status || '') !== processForm.status) {
        const updatedStatus = await processService.updateStatus(id, {
          status: processForm.status,
        })

        nextProcess =
          updatedStatus && typeof updatedStatus === 'object'
            ? { ...nextProcess, ...updatedStatus, status: processForm.status }
            : { ...nextProcess, status: processForm.status }
      }

      setProcess(nextProcess)
      setProcessForm(createProcessFormState(nextProcess))
      setIsEditing(false)
      setViewState({
        loading: false,
        error: '',
        success: 'Processo atualizado com sucesso.',
      })
    } catch (error) {
      setViewState({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel atualizar o processo agora.'),
        success: '',
      })
    } finally {
      setBusyState((current) => ({ ...current, saving: false }))
    }
  }

  const handleDocumentFileChange = (event) => {
    const file = event.target.files?.[0] || null

    if (!file) {
      setDocumentForm((current) => ({ ...current, file: null }))
      return
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      event.target.value = ''
      setDocumentForm((current) => ({ ...current, file: null }))
      setViewState({
        loading: false,
        error: 'Selecione um arquivo com ate 3 MB.',
        success: '',
      })
      return
    }

    setDocumentForm((current) => ({
      ...current,
      file,
      name: current.name || file.name,
    }))
    setViewState((current) => ({ ...current, error: '' }))
  }

  const handleAddDocument = async (event) => {
    event.preventDefault()

    if (!documentForm.file) {
      setViewState({
        loading: false,
        error: 'Selecione um arquivo para enviar.',
        success: '',
      })
      return
    }

    setBusyState((current) => ({ ...current, uploadingDocument: true }))
    setViewState((current) => ({ ...current, error: '', success: '' }))

    try {
      await processService.addDocument(id, {
        name: documentForm.name.trim() || documentForm.file.name,
        file: documentForm.file,
      })

      setDocumentForm({ name: '', file: null })
      if (documentInputRef.current) {
        documentInputRef.current.value = ''
      }

      setViewState({
        loading: false,
        error: '',
        success: 'Documento enviado com sucesso.',
      })
      await loadProcess({ preserveSuccess: true })
    } catch (error) {
      setViewState({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel enviar o documento agora.'),
        success: '',
      })
    } finally {
      setBusyState((current) => ({ ...current, uploadingDocument: false }))
    }
  }

  const handleAddUpdate = async (event) => {
    event.preventDefault()

    if (!updateForm.description.trim()) {
      setViewState({
        loading: false,
        error: 'Descreva o andamento antes de salvar.',
        success: '',
      })
      return
    }

    setBusyState((current) => ({ ...current, addingUpdate: true }))
    setViewState((current) => ({ ...current, error: '', success: '' }))

    try {
      await processService.addUpdate(id, {
        description: updateForm.description.trim(),
      })

      setUpdateForm({ description: '' })
      setViewState({
        loading: false,
        error: '',
        success: 'Andamento adicionado com sucesso.',
      })
      await loadProcess({ preserveSuccess: true })
    } catch (error) {
      setViewState({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel registrar o andamento agora.'),
        success: '',
      })
    } finally {
      setBusyState((current) => ({ ...current, addingUpdate: false }))
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Detalhes"
        title={process?.title || `Processo ${process?.processNumber || process?.number || id}`}
        description="Consulte os dados principais do processo, documentos e andamento do caso."
        action={
          <div className="row-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate(backPath)}
            >
              Voltar
            </button>

            {canEditProcess ? (
              isEditing ? (
                <button type="button" className="table-button" onClick={resetEditMode}>
                  Cancelar edicao
                </button>
              ) : (
                <button type="button" className="primary-button" onClick={handleStartEditing}>
                  Editar processo
                </button>
              )
            ) : null}
          </div>
        }
      />

      {viewState.loading ? <p className="muted">Carregando processo...</p> : null}
      {viewState.error ? <p className="form-error">{viewState.error}</p> : null}
      {viewState.success ? <p className="form-success">{viewState.success}</p> : null}

      {process ? (
        <div className="process-detail-shell">
          <article className="panel-card process-main-card">
            <div className="section-inline-header">
              <div>
                <p className="eyebrow">Processo</p>
                <h4>Informacoes principais</h4>
              </div>
              <span className={`status-pill ${getStatusTone(process?.status)}`}>
                {getDisplayValue(process?.status)}
              </span>
            </div>

            {isEditing ? (
              <form className="form-grid process-form-grid" onSubmit={handleSaveProcess}>
                <label>
                  Numero do processo
                  <input
                    value={processForm.processNumber}
                    onChange={handleProcessFieldChange('processNumber')}
                    required
                  />
                </label>

                <label>
                  Titulo
                  <input
                    value={processForm.title}
                    onChange={handleProcessFieldChange('title')}
                    required
                  />
                </label>

                <label>
                  Status
                  <select value={processForm.status} onChange={handleProcessFieldChange('status')}>
                    {PROCESS_STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tribunal
                  <input
                    value={processForm.court}
                    onChange={handleProcessFieldChange('court')}
                  />
                </label>

                <label>
                  Instancia
                  <input
                    value={processForm.instance}
                    onChange={handleProcessFieldChange('instance')}
                  />
                </label>

                <label>
                  Assunto
                  <input
                    value={processForm.subject}
                    onChange={handleProcessFieldChange('subject')}
                  />
                </label>

                <label>
                  Valor
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={processForm.value}
                    onChange={handleProcessFieldChange('value')}
                  />
                </label>

                <label className="full-span">
                  Descricao
                  <textarea
                    rows="5"
                    value={processForm.description}
                    onChange={handleProcessFieldChange('description')}
                  />
                </label>

                <div className="full-span row-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={busyState.saving}
                  >
                    {busyState.saving ? 'Salvando...' : 'Salvar alteracoes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="process-field-grid">
                  {processFields.map((field) => (
                    <div key={field.label} className="process-field-card">
                      <span>{field.label}</span>
                      <strong>{getDisplayValue(field.value)}</strong>
                    </div>
                  ))}
                </div>

                <div className="read-only-list compact-top">
                  <div>
                    <span>Descricao</span>
                    <strong>{getDisplayValue(process?.description)}</strong>
                  </div>
                </div>
              </>
            )}

          </article>

          <div className="panel-grid process-support-grid">
            <article className="panel-card">
              <div className="section-inline-header">
                <div>
                  <p className="eyebrow">Documentos</p>
                  <h4>Arquivos do processo</h4>
                </div>
                <span className="muted">{documents.length} arquivo(s)</span>
              </div>

              {documents.length ? (
                <div className="activity-list">
                  {documents.map((document, index) => {
                    const documentId = getEntityId(document) || getDocumentName(document, index)
                    const documentUrl = getDocumentUrl(document)

                    return (
                      <div key={documentId} className="activity-item">
                        <strong>{getDocumentName(document, index)}</strong>
                        {documentUrl ? (
                          <a
                            className="text-link"
                            href={documentUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Abrir documento
                          </a>
                        ) : (
                          <span className="muted">Arquivo disponivel no processo</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="muted">Nenhum documento cadastrado ate o momento.</p>
              )}

              {canEditProcess && !isEditing ? (
                <form className="stack-form compact-top" onSubmit={handleAddDocument}>
                  <label>
                    Nome do documento
                    <input
                      value={documentForm.name}
                      onChange={(event) =>
                        setDocumentForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Ex.: Peticao inicial"
                    />
                  </label>

                  <label>
                    Arquivo
                    <input
                      ref={documentInputRef}
                      type="file"
                      onChange={handleDocumentFileChange}
                    />
                    <small className="muted">
                      Envie um arquivo de ate 3 MB.
                    </small>
                  </label>

                  <button
                    type="submit"
                    className="secondary-button"
                    disabled={busyState.uploadingDocument}
                  >
                    {busyState.uploadingDocument ? 'Enviando...' : 'Enviar documento'}
                  </button>
                </form>
              ) : null}

              {canEditProcess && isEditing ? (
                <p className="muted compact-top">
                  Finalize ou cancele a edicao do processo para enviar novos documentos.
                </p>
              ) : null}
            </article>

            <article className="panel-card">
              <div className="section-inline-header">
                <div>
                  <p className="eyebrow">Andamentos</p>
                  <h4>Historico do caso</h4>
                </div>
                <span className="muted">{updates.length} registro(s)</span>
              </div>

              {updates.length ? (
                <div className="activity-list">
                  {updates.map((update, index) => (
                    <div
                      key={getEntityId(update) || `${index}-${getUpdateText(update, index)}`}
                      className="activity-item"
                    >
                      <strong>{`Andamento ${index + 1}`}</strong>
                      <span>{getUpdateText(update, index)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">Nenhum andamento registrado ate o momento.</p>
              )}

              {canEditProcess && !isEditing ? (
                <form className="stack-form compact-top" onSubmit={handleAddUpdate}>
                  <label>
                    Novo andamento
                    <textarea
                      rows="4"
                      value={updateForm.description}
                      onChange={(event) =>
                        setUpdateForm({ description: event.target.value })
                      }
                      placeholder="Descreva o andamento a ser registrado"
                    />
                  </label>

                  <button
                    type="submit"
                    className="secondary-button"
                    disabled={busyState.addingUpdate}
                  >
                    {busyState.addingUpdate ? 'Salvando...' : 'Adicionar andamento'}
                  </button>
                </form>
              ) : null}

              {canEditProcess && isEditing ? (
                <p className="muted compact-top">
                  Finalize ou cancele a edicao do processo para registrar um novo andamento.
                </p>
              ) : null}
            </article>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default ProcessDetailsPage
