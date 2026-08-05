import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/explore'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const passwordError = form.password && form.password.length < 6 ? 'At least 6 characters' : ''

  const submit = async (e) => {
    e.preventDefault()
    if (passwordError) return
    setSubmitting(true)
    setError('')
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created — welcome to FuelLex!')
      navigate(from)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the community and help keep prices honest."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {error && (
        <p className="mb-4 rounded-[10px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
      <form onSubmit={submit} noValidate>
        <Field
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Ada Obi"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          error={passwordError}
          hint="Public accounts are standard members — admins are seeded separately."
          required
        />
        <Button type="submit" block loading={submitting} className="mt-2">
          {submitting ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
