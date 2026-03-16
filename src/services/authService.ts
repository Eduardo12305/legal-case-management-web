import axios from 'axios'
import http from './http'

const authService = {
  login: async (payload) => {
    const response = await axios.post('/api/auth/login', payload, {
      baseURL: http.defaults.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    })

    if (response?.data?.requiresPasswordChange) {
      return response.data
    }

    if (response.status >= 400) {
      const message =
        response?.data?.message ||
        response?.data?.error ||
        'Nao foi possivel concluir o acesso.'

      throw new Error(message)
    }

    return response.data
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

  changeFirstAccessPassword: async (payload) => {
    const response = await axios.post('/api/auth/first-access/change-password', payload, {
      baseURL: http.defaults.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    })

    if (response.status >= 400) {
      console.error('Primeiro acesso - erro da API:', response.data)

      const message =
        response?.data?.message ||
        response?.data?.error ||
        'Nao foi possivel concluir o primeiro acesso.'

      throw new Error(message)
    }

    return response.data
  },
}

export default authService
