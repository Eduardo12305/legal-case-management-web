import { useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import useAuth from '../hooks/useAuth'
import chatService from '../services/chatService'
import userService from '../services/userService'
import { asArray, getEntityId, getErrorMessage } from '../utils/helpers'
import { canManageUsers } from '../utils/roles'

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
  }
}

function extractProfileContacts(user) {
  const candidates = [
    ...PROFILE_CONTACT_KEYS.map((key) => createContact(user?.[key], 'Contato')),
    ...PROFILE_CONTACT_LIST_KEYS.flatMap((key) =>
      asArray(user?.[key]).map((item) => createContact(item, 'Contato')),
    ),
  ]

  const contactsMap = new Map()

  candidates.filter(Boolean).forEach((contact) => {
    contactsMap.set(contact.id, contact)
  })

  return Array.from(contactsMap.values())
}

function normalizeMessages(messages) {
  return asArray(messages)
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
      message?.senderId || '',
      message?.recipientId || '',
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
  const { role, token, user } = useAuth()
  const currentUserId = getEntityId(user)
  const canLoadUsers = canManageUsers(role)
  const streamRef = useRef(null)
  const [contacts, setContacts] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [manualRecipientId, setManualRecipientId] = useState('')
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [contactsState, setContactsState] = useState({ loading: true, error: '' })
  const [conversationState, setConversationState] = useState({ loading: false, error: '' })
  const [sendState, setSendState] = useState({ loading: false, error: '' })
  const [streamState, setStreamState] = useState({ connected: false, error: '' })

  const availableContacts = useMemo(() => {
    const combined = [...contacts, ...extractProfileContacts(user)]
    const uniqueContacts = new Map()

    combined.forEach((contact) => {
      if (!contact?.id || contact.id === currentUserId) {
        return
      }

      uniqueContacts.set(contact.id, contact)
    })

    return Array.from(uniqueContacts.values())
  }, [contacts, currentUserId, user])

  const selectedContact = useMemo(
    () =>
      availableContacts.find((contact) => contact.id === selectedUserId) ||
      (selectedUserId
        ? {
            id: selectedUserId,
            name: `Contato ${selectedUserId.slice(0, 8)}`,
            email: '',
            role: '',
          }
        : null),
    [availableContacts, selectedUserId],
  )

  useEffect(() => {
    async function loadContacts() {
      if (!canLoadUsers) {
        setContactsState({ loading: false, error: '' })
        return
      }

      setContactsState({ loading: true, error: '' })

      try {
        const response = await userService.list()
        const items = asArray(response?.users || response)
          .map((item) => createContact(item, 'Usuario'))
          .filter(Boolean)
        setContacts(items)
        setContactsState({ loading: false, error: '' })
      } catch (error) {
        setContactsState({ loading: false, error: getErrorMessage(error) })
      }
    }

    loadContacts()
  }, [canLoadUsers])

  useEffect(() => {
    if (!selectedUserId && availableContacts.length) {
      setSelectedUserId(availableContacts[0].id)
    }
  }, [availableContacts, selectedUserId])

  useEffect(() => {
    async function loadConversation() {
      if (!selectedUserId) {
        setMessages([])
        return
      }

      setConversationState({ loading: true, error: '' })

      try {
        const data = await chatService.getConversation(selectedUserId)
        setMessages(normalizeMessages(data?.messages))
        setConversationState({ loading: false, error: '' })
      } catch (error) {
        setMessages([])
        setConversationState({ loading: false, error: getErrorMessage(error) })
      }
    }

    loadConversation()
  }, [selectedUserId])

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.close()
      streamRef.current = null
    }

    if (!selectedUserId || !token) {
      setStreamState({ connected: false, error: '' })
      return undefined
    }

    const stream = chatService.createStream({ token, recipientId: selectedUserId })
    streamRef.current = stream
    setStreamState({ connected: false, error: '' })

    stream.onopen = () => {
      setStreamState({ connected: true, error: '' })
    }

    stream.addEventListener('chat.message', (event) => {
      try {
        const message = JSON.parse(event.data)
        setMessages((current) => mergeMessages(current, [message]))
      } catch {
        setStreamState((current) => ({
          ...current,
          error: 'Nao foi possivel atualizar a conversa em tempo real.',
        }))
      }
    })

    stream.onerror = () => {
      setStreamState({ connected: false, error: 'Conexao em tempo real indisponivel no momento.' })
    }

    return () => {
      stream.close()
      if (streamRef.current === stream) {
        streamRef.current = null
      }
    }
  }, [selectedUserId, token])

  const handleSelectContact = (contactId) => {
    setSelectedUserId(contactId)
    setMessageText('')
    setSendState({ loading: false, error: '' })
  }

  const handleManualConversation = (event) => {
    event.preventDefault()
    const nextRecipientId = manualRecipientId.trim()

    if (!nextRecipientId) {
      return
    }

    setSelectedUserId(nextRecipientId)
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!selectedUserId || !messageText.trim()) {
      return
    }

    setSendState({ loading: true, error: '' })

    try {
      const response = await chatService.sendMessage({
        recipientId: selectedUserId,
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
      setSendState({ loading: false, error: getErrorMessage(error) })
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Chat"
        title="Mensagens"
        description="Converse com outro usuario autenticado, acompanhe o historico e receba novas mensagens em tempo real."
      />

      <div className="chat-shell">
        <aside className="panel-card chat-sidebar">
          <div className="section-inline-header">
            <div>
              <p className="eyebrow">Conversas</p>
              <h4>Destinatarios</h4>
            </div>
            <span className="muted">{availableContacts.length} contato(s)</span>
          </div>

          {!canLoadUsers ? (
            <form className="stack-form compact-top" onSubmit={handleManualConversation}>
              <label>
                Id do destinatario
                <input
                  value={manualRecipientId}
                  onChange={(event) => setManualRecipientId(event.target.value)}
                  placeholder="Cole aqui o id do outro usuario"
                />
              </label>
              <button type="submit" className="secondary-button">
                Abrir conversa
              </button>
              <p className="muted">
                Seu perfil nao carrega a lista completa de usuarios. Informe o id do contato para abrir a conversa.
              </p>
            </form>
          ) : null}

          {contactsState.error ? <p className="form-error compact-top">{contactsState.error}</p> : null}
          {contactsState.loading ? <p className="muted compact-top">Carregando contatos...</p> : null}

          {availableContacts.length ? (
            <div className="chat-contact-list compact-top">
              {availableContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  className={`chat-contact-card ${selectedUserId === contact.id ? 'active' : ''}`}
                  onClick={() => handleSelectContact(contact.id)}
                >
                  <strong>{contact.name}</strong>
                  <span>{contact.email || contact.role || contact.id}</span>
                </button>
              ))}
            </div>
          ) : !contactsState.loading ? (
            <p className="muted compact-top">Nenhum contato disponivel para iniciar conversa.</p>
          ) : null}
        </aside>

        <article className="panel-card chat-panel">
          <div className="section-inline-header">
            <div>
              <p className="eyebrow">Conversa ativa</p>
              <h4>{selectedContact?.name || 'Selecione um contato'}</h4>
            </div>
            <span className={`status-pill ${streamState.connected ? 'on' : 'neutral'}`}>
              {streamState.connected ? 'Ao vivo' : 'Sem stream'}
            </span>
          </div>

          {selectedContact ? (
            <div className="read-only-list compact-top">
              <div>
                <span>Destinatario</span>
                <strong>{selectedContact.name}</strong>
              </div>
            </div>
          ) : null}

          {conversationState.error ? <p className="form-error compact-top">{conversationState.error}</p> : null}
          {streamState.error ? <p className="form-error compact-top">{streamState.error}</p> : null}

          <div className="chat-message-list compact-top">
            {conversationState.loading ? (
              <p className="muted">Carregando mensagens...</p>
            ) : messages.length ? (
              messages.map((message) => {
                const isOwnMessage = message?.senderId === currentUserId

                return (
                  <div
                    key={message?.id || `${message?.senderId}-${message?.createdAt}-${message?.content}`}
                    className={`chat-message ${isOwnMessage ? 'own' : ''}`}
                  >
                    <strong>{isOwnMessage ? 'Voce' : selectedContact?.name || 'Contato'}</strong>
                    <p>{message?.content || '-'}</p>
                    <span>{formatMessageTime(message?.createdAt)}</span>
                  </div>
                )
              })
            ) : (
              <p className="muted">
                {selectedUserId
                  ? 'Nenhuma mensagem encontrada para esta conversa.'
                  : 'Escolha um destinatario para carregar o historico.'}
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
                disabled={!selectedUserId || sendState.loading}
              />
            </label>
            {sendState.error ? <p className="form-error full-span">{sendState.error}</p> : null}
            <button
              type="submit"
              className="primary-button"
              disabled={!selectedUserId || !messageText.trim() || sendState.loading}
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
