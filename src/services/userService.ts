import http from './http'

const userService = {
  list: async () => {
    const { data } = await http.get('/api/users')
    return data
  },

  toggleActive: async (userId) => {
    const { data } = await http.patch(`/api/users/${userId}/toggle-active`)
    return data
  },

  updateStaffPermissions: async (userId, payload) => {
    const { data } = await http.put(`/api/users/${userId}/staff-permissions`, payload)
    return data
  },

  listClients: async (filters = {}) => {
    const query = filters.query?.trim()
    const digitsOnly = query?.replace(/\D/g, '') || ''
    const params = {}

    if (query) {
      params.search = query

      if (query.includes('@')) {
        params.email = query
      }

      if (digitsOnly.length >= 11) {
        params.cpf = digitsOnly
      }

      if (digitsOnly.length >= 8) {
        params.phone = digitsOnly
      }
    }

    if (filters.active !== 'all') {
      params.active = filters.active === 'active'
    }

    const { data } = await http.get('/api/clients', { params })
    return data
  },

  toggleClientActive: async (clientId) => {
    const { data } = await http.patch(`/api/clients/${clientId}/active`)
    return data
  },
}

export default userService
