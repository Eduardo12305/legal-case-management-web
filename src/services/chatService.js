import http from './http'

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
}

export default chatService
