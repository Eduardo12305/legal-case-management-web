import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import chatService from '../services/chatService'
import userService from '../services/userService'
import { formatCpf } from '../utils/forms'
import { asArray, getEntityId, getErrorMessage } from '../utils/helpers'
import {
  canStartGeneralChat,
  canStartLawyerChat,
  isAdmin,
  isClient,
  isLawyer,
  isStaff,
} from '../utils/roles'

const CHAT_TYPES = {
  GENERAL: 'GENERAL',
  LAWYER: 'LAWYER',
}

const PROFILE_CONTACT_KEYS = [
  'lawyer',
  'assignedLawyer',
  'responsibleLawyer',
  'responsibleUser',
  'accountManager',
  'attendant',
  'supportUser',
]

const PROFILE_CONTACT_LIST_KEYS = ['lawyers', 'contacts', 'supportContacts']

function isChatEligibleUser(entity) {
  const isActive = typeof entity?.active === 'boolean' ? entity.active : true
  const isEmailVerified =
    typeof entity?.emailVerified === 'boolean' ? entity.emailVerified : true

  return isActive && isEmailVerified
}

function createContact(entity, fallbackLabel = 'Contato') {
  const id = getEntityId(entity)

  if (!id) {
    return null
  }

  return {
    id,
    name:
      entity?.name ||
      entity?.fullName ||
      entity?.email ||
      entity?.username ||
      `${fallbackLabel} ${id.slice(0, 8)}`,
    email: entity?.email || '',
    role: entity?.role || '',
    active: entity?.active,
    emailVerified: entity?.emailVerified,
  }
}

function dedupeById(items) {
  const map = new Map()

  items.filter(Boolean).forEach((item) => {
    map.set(item.id, item)
  })

  return Array.from(map.values())
}

function extractProfileContacts(user) {
  const candidates = [
    ...PROFILE_CONTACT_KEYS.map((key) => createContact(user?.[key], 'Contato')),
    ...PROFILE_CONTACT_LIST_KEYS.flatMap((key) =>
      asArray(user?.[key]).map((item) => createContact(item, 'Contato')),
    ),
  ]

  return dedupeById(candidates).filter(isChatEligibleUser)
}

function getConversationId(conversation) {
  return conversation?.conversationId || conversation?.id || conversation?._id || ''
}

function getConversationType(conversation) {
  return conversation?.type || conversation?.conversationType || CHAT_TYPES.GENERAL
}

function getConversationClientId(conversation) {
  return (
    conversation?.clientUserId ||
    conversation?.clientId ||
    getEntityId(conversation?.clientUser) ||
    getEntityId(conversation?.client) ||
    ''
  )
}

function getConversationLawyerId(conversation) {
  return (
    conversation?.lawyerUserId ||
    conversation?.lawyerId ||
    getEntityId(conversation?.lawyerUser) ||
    getEntityId(conversation?.lawyer) ||
    ''
  )
}

function getConversationParticipants(conversation) {
  return dedupeById([
    ...asArray(conversation?.participants).map((participant) =>
      createContact(participant, 'Contato'),
    ),
    createContact(conversation?.clientUser || conversation?.client, 'Cliente'),
    createContact(conversation?.lawyerUser || conversation?.lawyer, 'Advogado'),
    createContact(conversation?.staffUser || conversation?.staff, 'Atendimento'),
    createContact(conversation?.adminUser || conversation?.admin, 'Administracao'),
    createContact(conversation?.user, 'Contato'),
  ])
}

function getConversationCounterpart(conversation, currentUserId) {
  const participants = getConversationParticipants(conversation)

  return participants.find((participant) => participant.id !== currentUserId) || participants[0] || null
}

function getConversationTitle(conversation, role, currentUserId) {
  const counterpart = getConversationCounterpart(conversation, currentUserId)
  const type = getConversationType(conversation)

  if (conversation?.title) {
    return conversation.title
  }

  if (type === CHAT_TYPES.GENERAL) {
    return isClient(role) ? 'Atendimento geral' : counterpart?.name || 'Atendimento geral'
  }

  if (type === CHAT_TYPES.LAWYER) {
    if (isLawyer(role)) {
      return counterpart?.name || 'Cliente'
    }

    return counterpart?.name || 'Advogado responsavel'
  }

  return counterpart?.name || 'Conversa'
}

function normalizeConversation(conversation, currentUserId, role) {
  const id = getConversationId(conversation)

  if (!id) {
    return null
  }

  const type = getConversationType(conversation)
  const counterpart = getConversationCounterpart(conversation, currentUserId)

  return {
    id,
    type,
    title: getConversationTitle(conversation, role, currentUserId),
    subtitle:
      type === CHAT_TYPES.LAWYER ? 'Canal juridico' : 'Canal geral',
    counterpart,
    clientUserId: getConversationClientId(conversation),
    lawyerUserId: getConversationLawyerId(conversation),
    raw: conversation,
  }
}

function extractConversationList(data, currentUserId, role) {
  return asArray(data?.conversations || data)
    .map((conversation) => normalizeConversation(conversation, currentUserId, role))
    .filter(Boolean)
}

function upsertConversation(conversations, nextConversation) {
  const map = new Map(conversations.map((conversation) => [conversation.id, conversation]))

  map.set(nextConversation.id, nextConversation)

  return Array.from(map.values())
}

function getMessageSenderId(message) {
  return (
    message?.senderId ||
    message?.senderUserId ||
    getEntityId(message?.sender) ||
    getEntityId(message?.user) ||
    ''
  )
}

function extractMessages(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.messages)) {
    return data.messages
  }

  if (Array.isArray(data?.items)) {
    return data.items
  }

  return []
}

function normalizeMessages(messages) {
  return extractMessages(messages)
    .filter(Boolean)
    .sort((left, right) => {
      const leftTime = new Date(left?.createdAt || 0).getTime()
      const rightTime = new Date(right?.createdAt || 0).getTime()
      return leftTime - rightTime
    })
}

function mergeMessages(currentMessages, incomingMessages) {
  const nextMap = new Map()

  normalizeMessages([...currentMessages, ...incomingMessages]).forEach((message) => {
    const fallbackId = [
      getMessageSenderId(message),
      message?.createdAt || '',
      message?.content || '',
    ].join(':')

    nextMap.set(message?.id || fallbackId, message)
  })

  return Array.from(nextMap.values()).sort((left, right) => {
    const leftTime = new Date(left?.createdAt || 0).getTime()
    const rightTime = new Date(right?.createdAt || 0).getTime()
    return leftTime - rightTime
  })
}

function formatMessageTime(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ChatPage() {
  const { role, user } = useAuth()
  const currentUserId = getEntityId(user)
  const canUseChat = isChatEligibleUser(user)
  const canSearchClients = isAdmin(role) || isStaff(role) || isLawyer(role)
  const canResolveGeneral = canUseChat && canStartGeneralChat(role)
  const canResolveLawyer = canUseChat && canStartLawyerChat(role)
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [conversationListState, setConversationListState] = useState({
    loading: true,
    error: '',
  })
  const [conversationState, setConversationState] = useState({
    loading: false,
    error: '',
  })
  const [sendState, setSendState] = useState({ loading: false, error: '' })
  const [resolveState, setResolveState] = useState({ loading: false, error: '' })
  const [clientSearch, setClientSearch] = useState('')
  const [clientOptions, setClientOptions] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientSearchState, setClientSearchState] = useState({
    loading: false,
    error: '',
  })

  const profileContacts = useMemo(
    () => extractProfileContacts(user).filter((contact) => contact.id !== currentUserId),
    [currentUserId, user],
  )
  const lawyerContacts = useMemo(
    () =>
      profileContacts.filter((contact) => {
        const normalizedRole = String(contact.role || '').toUpperCase()
        return !normalizedRole || normalizedRole === 'LAWYER'
      }),
    [profileContacts],
  )
  const selectedConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId],
  )

  useEffect(() => {
    async function loadConversations() {
      if (!canUseChat) {
        setConversations([])
        setConversationListState({ loading: false, error: '' })
        return
      }

      setConversationListState({ loading: true, error: '' })

      try {
        const response = await chatService.listConversations()
        const items = extractConversationList(response, currentUserId, role)
        setConversations(items)
        setConversationListState({ loading: false, error: '' })
      } catch (error) {
        setConversations([])
        setConversationListState({
          loading: false,
          error: getErrorMessage(error, 'Nao foi possivel carregar as conversas agora.'),
        })
      }
    }

    loadConversations()
  }, [canUseChat, currentUserId, role])

  useEffect(() => {
    if (!selectedConversationId && conversations.length) {
      setSelectedConversationId(conversations[0].id)
      return
    }

    if (
      selectedConversationId &&
      !conversations.some((conversation) => conversation.id === selectedConversationId)
    ) {
      setSelectedConversationId(conversations[0]?.id || null)
    }
  }, [conversations, selectedConversationId])

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) {
        setMessages([])
        setConversationState({ loading: false, error: '' })
        return
      }

      setConversationState({ loading: true, error: '' })

      try {
        const data = await chatService.getMessages(selectedConversationId)
        setMessages(normalizeMessages(data))
        setConversationState({ loading: false, error: '' })
      } catch (error) {
        setMessages([])
        setConversationState({
          loading: false,
          error: getErrorMessage(error, 'Nao foi possivel carregar as mensagens agora.'),
        })
      }
    }

    loadMessages()
  }, [selectedConversationId])

  const handleClientSearch = async (event) => {
    event.preventDefault()

    if (!clientSearch.trim()) {
      setClientOptions([])
      setSelectedClient(null)
      return
    }

    setClientSearchState({ loading: true, error: '' })

    try {
      const data = await userService.listClients({ query: clientSearch, active: 'active' })
      const items = asArray(data).filter(isChatEligibleUser)
      setClientOptions(items)
      setSelectedClient(null)
      setClientSearchState({ loading: false, error: '' })
    } catch (error) {
      setClientOptions([])
      setSelectedClient(null)
      setClientSearchState({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel localizar clientes agora.'),
      })
    }
  }

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId)
    setMessageText('')
    setSendState({ loading: false, error: '' })
    setResolveState({ loading: false, error: '' })
  }

  const handleResolveConversation = async (payload) => {
    setResolveState({ loading: true, error: '' })

    try {
      const response = await chatService.resolveConversation(payload)
      const nextConversation = normalizeConversation(
        response?.conversation || response,
        currentUserId,
        role,
      )

      if (!nextConversation) {
        throw new Error('resolve-conversation')
      }

      setConversations((current) => upsertConversation(current, nextConversation))
      setSelectedConversationId(nextConversation.id)
      setMessageText('')
      setClientOptions([])
      setResolveState({ loading: false, error: '' })
    } catch (error) {
      setResolveState({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel abrir a conversa agora.'),
      })
    }
  }

  const handleResolveGeneralConversation = async () => {
    const clientUserId = isClient(role) ? currentUserId : getEntityId(selectedClient)

    if (!clientUserId) {
      setResolveState({
        loading: false,
        error: 'Selecione um cliente para abrir o atendimento.',
      })
      return
    }

    await handleResolveConversation({
      type: CHAT_TYPES.GENERAL,
      clientUserId,
    })
  }

  const handleResolveLawyerConversation = async (lawyerUserIdOverride) => {
    const clientUserId = isClient(role) ? currentUserId : getEntityId(selectedClient)
    const lawyerUserId = lawyerUserIdOverride || currentUserId

    if (!clientUserId || !lawyerUserId) {
      setResolveState({
        loading: false,
        error: 'Nao foi possivel identificar os participantes desta conversa.',
      })
      return
    }

    await handleResolveConversation({
      type: CHAT_TYPES.LAWYER,
      clientUserId,
      lawyerUserId,
    })
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!selectedConversationId || !messageText.trim()) {
      return
    }

    setSendState({ loading: true, error: '' })

    try {
      const response = await chatService.sendMessage(selectedConversationId, {
        content: messageText.trim(),
      })

      const sentMessage =
        response?.message && typeof response.message === 'object'
          ? response.message
          : response && typeof response === 'object' && response.content
            ? response
            : null

      if (sentMessage) {
        setMessages((current) => mergeMessages(current, [sentMessage]))
      }

      setMessageText('')
      setSendState({ loading: false, error: '' })
    } catch (error) {
      setSendState({
        loading: false,
        error: getErrorMessage(error, 'Nao foi possivel enviar a mensagem agora.'),
      })
    }
  }

  const selectedConversationTypeLabel =
    selectedConversation?.type === CHAT_TYPES.LAWYER ? 'Conversa juridica' : 'Atendimento geral'

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Chat"
        title="Mensagens"
        description="Acesse suas conversas, abra um canal permitido para o seu perfil e acompanhe o historico das mensagens."
      />

      <div className="chat-shell">
        <aside className="panel-card chat-sidebar">
          <div className="section-inline-header">
            <div>
              <p className="eyebrow">Conversas</p>
              <h4>Canais disponiveis</h4>
            </div>
            <span className="muted">{conversations.length} conversa(s)</span>
          </div>

          {!canUseChat ? (
            <p className="form-error compact-top">
              Sua conta precisa estar ativa e com email confirmado para usar o chat.
            </p>
          ) : null}

          {canUseChat && isClient(role) ? (
            <div className="stack-form compact-top">
              {canResolveGeneral ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleResolveGeneralConversation}
                  disabled={resolveState.loading}
                >
                  {resolveState.loading ? 'Abrindo...' : 'Atendimento geral'}
                </button>
              ) : null}

              {canResolveLawyer ? (
                lawyerContacts.length ? (
                  lawyerContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      className="secondary-button"
                      onClick={() => handleResolveLawyerConversation(contact.id)}
                      disabled={resolveState.loading}
                    >
                      Conversar com {contact.name}
                    </button>
                  ))
                ) : (
                  <p className="muted">
                    Nenhum advogado elegivel foi identificado no seu perfil para abrir conversa juridica.
                  </p>
                )
              ) : null}
            </div>
          ) : null}

          {canUseChat && canSearchClients ? (
            <div className="compact-top">
              <form className="search-grid" onSubmit={handleClientSearch}>
                <label className="full-span">
                  Buscar cliente
                  <input
                    value={clientSearch}
                    onChange={(event) => setClientSearch(event.target.value)}
                    placeholder="Digite CPF, nome, email ou telefone"
                  />
                </label>
                <button
                  type="submit"
                  className="secondary-button"
                  disabled={clientSearchState.loading}
                >
                  {clientSearchState.loading ? 'Buscando...' : 'Buscar cliente'}
                </button>
              </form>

              {clientSearchState.error ? (
                <p className="form-error compact-top">{clientSearchState.error}</p>
              ) : null}

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
                        getEntityId(selectedClient) === getEntityId(client) ? 'active' : ''
                      }`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <strong>{client.name || 'Cliente sem nome'}</strong>
                      <span>{formatCpf(client.cpf) || 'CPF nao informado'}</span>
                      <small>{client.email || client.phone || 'Sem contato cadastrado'}</small>
                    </button>
                  ))}
                </div>
              ) : null}

              {selectedClient ? (
                <div className="quick-actions compact-top">
                  {(isAdmin(role) || isStaff(role)) && canResolveGeneral ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleResolveGeneralConversation}
                      disabled={resolveState.loading}
                    >
                      {resolveState.loading ? 'Abrindo...' : 'Abrir atendimento geral'}
                    </button>
                  ) : null}

                  {isLawyer(role) && canResolveLawyer ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleResolveLawyerConversation(currentUserId)}
                      disabled={resolveState.loading}
                    >
                      {resolveState.loading ? 'Abrindo...' : 'Abrir conversa juridica'}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {resolveState.error ? <p className="form-error compact-top">{resolveState.error}</p> : null}
          {conversationListState.error ? (
            <p className="form-error compact-top">{conversationListState.error}</p>
          ) : null}
          {conversationListState.loading ? (
            <p className="muted compact-top">Carregando conversas...</p>
          ) : null}

          {conversations.length ? (
            <div className="chat-contact-list compact-top">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`chat-contact-card ${
                    selectedConversationId === conversation.id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <strong>{conversation.title}</strong>
                  <span>{conversation.subtitle}</span>
                </button>
              ))}
            </div>
          ) : !conversationListState.loading ? (
            <p className="muted compact-top">
              Nenhuma conversa disponivel no momento.
            </p>
          ) : null}
        </aside>

        <article className="panel-card chat-panel">
          <div className="section-inline-header">
            <div>
              <p className="eyebrow">Conversa ativa</p>
              <h4>{selectedConversation?.title || 'Selecione uma conversa'}</h4>
            </div>
            <span className={`status-pill ${selectedConversation ? 'on' : 'neutral'}`}>
              {selectedConversation ? selectedConversationTypeLabel : 'Sem conversa'}
            </span>
          </div>

          {selectedConversation ? (
            <div className="read-only-list compact-top">
              <div>
                <span>Canal</span>
                <strong>{selectedConversation.subtitle}</strong>
              </div>
              {selectedConversation.counterpart ? (
                <div>
                  <span>Contato</span>
                  <strong>{selectedConversation.counterpart.name}</strong>
                </div>
              ) : null}
            </div>
          ) : null}

          {conversationState.error ? (
            <p className="form-error compact-top">{conversationState.error}</p>
          ) : null}

          <div className="chat-message-list compact-top">
            {conversationState.loading ? (
              <p className="muted">Carregando mensagens...</p>
            ) : messages.length ? (
              messages.map((message) => {
                const isOwnMessage = getMessageSenderId(message) === currentUserId

                return (
                  <div
                    key={
                      message?.id ||
                      `${getMessageSenderId(message)}-${message?.createdAt}-${message?.content}`
                    }
                    className={`chat-message ${isOwnMessage ? 'own' : ''}`}
                  >
                    <strong>
                      {isOwnMessage
                        ? 'Voce'
                        : selectedConversation?.counterpart?.name || 'Contato'}
                    </strong>
                    <p>{message?.content || '-'}</p>
                    <span>{formatMessageTime(message?.createdAt)}</span>
                  </div>
                )
              })
            ) : (
              <p className="muted">
                {selectedConversationId
                  ? 'Nenhuma mensagem encontrada para esta conversa.'
                  : 'Escolha ou abra uma conversa para carregar o historico.'}
              </p>
            )}
          </div>

          <form className="chat-compose" onSubmit={handleSendMessage}>
            <label className="full-span">
              Mensagem
              <textarea
                rows="4"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Digite sua mensagem"
                disabled={!selectedConversationId || sendState.loading || !canUseChat}
              />
            </label>
            {sendState.error ? <p className="form-error full-span">{sendState.error}</p> : null}
            <button
              type="submit"
              className="primary-button"
              disabled={!selectedConversationId || !messageText.trim() || sendState.loading || !canUseChat}
            >
              {sendState.loading ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </form>
        </article>
      </div>
    </section>
  )
}

export default ChatPage
