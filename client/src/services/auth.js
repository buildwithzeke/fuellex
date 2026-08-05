import api from '../lib/api'

/** POST /api/auth/register → user (public registration is locked to the USER role) */
export const register = async (name, email, password) => {
  const envelope = await api.post('/api/auth/register', { name, email, password })
  return envelope.data
}

/** POST /api/auth/login → { token, user } */
export const login = async (email, password) => {
  const envelope = await api.post('/api/auth/login', { email, password })
  return envelope.data
}

/** GET /api/auth/profile → user */
export const getProfile = async () => {
  const envelope = await api.get('/api/auth/profile')
  return envelope.data
}
