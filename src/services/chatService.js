import http from './http'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const chatService = {
  listConversations: async () => {
    const { data } = await http.get('/api/chat/conversations')
    return data
  },

  resolveConversation: async (payload) => {
    const { data } = await http.post('/api/chat/conversations/resolve', payload)
    return data
  },

  getMessages: async (conversationId) => {
    const { data } = await http.get(`/api/chat/conversations/${conversationId}/messages`)
    return data
  },

  sendMessage: async (conversationId, payload) => {
    const { data } = await http.post(`/api/chat/conversations/${conversationId}/messages`, payload)
    return data
  },

  createStream: ({ conversationId, token }) => {
    const streamUrl = new URL('/api/chat/stream', API_BASE_URL)
    streamUrl.searchParams.set('conversationId', conversationId)
    streamUrl.searchParams.set('token', token)

    return new EventSource(streamUrl.toString())
  },
}

export default chatService
