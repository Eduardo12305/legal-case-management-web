import http from './http'

const authService = {
  login: async (payload) => {
    const { data } = await http.post('/api/auth/login', payload)
    return data
  },

  createInvite: async (payload) => {
    const { data } = await http.post('/api/auth/invites', payload)
    return data
  },

  getProfile: async () => {
    const { data } = await http.get('/api/users/profile')
    return data
  },

  updateProfile: async (payload) => {
    const { data } = await http.put('/api/users/profile', payload)
    return data
  },

  updateClientProfile: async (payload) => {
    const { data } = await http.put('/api/users/profile/client', payload)
    return data
  },

  changePassword: async (payload) => {
    const { data } = await http.put('/api/users/change-password', payload)
    return data
  },
}

export default authService
