import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000'

export const TOKEN_KEY = 'fuellex_token'
export const USER_KEY = 'fuellex_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}
export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user))

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Unwrap the `{ success, message, data }` envelope; normalize failures to Error.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken()
    }
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
    const normalized = new Error(message)
    normalized.status = error.response?.status || 0
    return Promise.reject(normalized)
  }
)

export default api
