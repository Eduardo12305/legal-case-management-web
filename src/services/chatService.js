import http from './http'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const chatService = {
  getConversation: async (userId) => {
    const { data } = await http.get(`/api/chat/conversation/${userId}`)
    return data
  },

  sendMessage: async (payload) => {
    const { data } = await http.post('/api/chat', payload)
    return data
  },

  createStream: ({ token, recipientId }) => {
    const streamUrl = new URL('/api/chat/stream', API_BASE_URL)
    streamUrl.searchParams.set('token', token)
    streamUrl.searchParams.set('recipientId', recipientId)

    return new EventSource(streamUrl.toString())
  },
}

export default chatService
