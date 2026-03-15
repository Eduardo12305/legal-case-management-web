import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

http.setToken = (token) => {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete http.defaults.headers.common.Authorization
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Nao foi possivel concluir a solicitacao.'

    return Promise.reject(new Error(message))
  },
)

export default http
