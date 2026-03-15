export const AUTH_STORAGE_KEY = 'advon.auth'

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || {
      token: null,
      user: null,
      role: '',
    }
  } catch {
    return { token: null, user: null, role: '' }
  }
}

export function setStoredAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
