import http from './http'

const processService = {
  listMine: async () => {
    const { data } = await http.get('/api/processes/my')
    return data
  },

  listAll: async () => {
    const { data } = await http.get('/api/processes')
    return data
  },

  create: async (payload) => {
    const { data } = await http.post('/api/processes', payload)
    return data
  },

  listByClient: async (clientId) => {
    const { data } = await http.get(`/api/processes/client/${clientId}`)
    return data
  },

  getById: async (id) => {
    const { data } = await http.get(`/api/processes/${id}`)
    return data
  },

  update: async (id, payload) => {
    const { data } = await http.put(`/api/processes/${id}`, payload)
    return data
  },

  updateStatus: async (id, payload) => {
    const { data } = await http.patch(`/api/processes/${id}/status`, payload)
    return data
  },

  addDocument: async (id, payload) => {
    if (payload?.file) {
      const formData = new FormData()
      formData.append('name', payload.name || payload.file.name)
      formData.append('file', payload.file)

      const { data } = await http.post(`/api/processes/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return data
    }

    const { data } = await http.post(`/api/processes/${id}/documents`, payload)
    return data
  },

  addUpdate: async (id, payload) => {
    const { data } = await http.post(`/api/processes/${id}/updates`, payload)
    return data
  },
}

export default processService
