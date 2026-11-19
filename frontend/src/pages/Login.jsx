import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { getErrorMessage } from '../services/api.js'

const IMAGE =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'

export default function Login() {
  const { user, loading, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password to continue.')
      return
    }

    setSubmitting(true)
    try {
      const data = await login({ email: form.email.trim(), password: form.password })
      toast.success('Welcome back. Your table is waiting.')
      const destination = data.user?.role === 'admin' && from === '/' ? '/admin' : from
      navigate(destination, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign in. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-coffee-900/10 bg-white shadow-soft lg:grid-cols-2">
        <div className="p-6 sm:p-10 lg:p-12">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-3 text-3xl text-coffee-900 sm:text-4xl">
            Sign in to your table.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-coffee-500">
            View your reservations, make a new booking or update your details.
          </p>

          {error && (
            <div className="mt-6 flex gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Field
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              icon={Lock}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="rounded-full p-2 text-coffee-400 transition hover:text-coffee-900"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-coffee-500">
            New to CafeBook?{' '}
            <Link
              to="/register"
              state={{ from }}
              className="font-semibold text-coffee-900 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="relative hidden min-h-[520px] lg:block">
          <SmartImage
            src={IMAGE}
            alt="Coffee being poured at CafeBook"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-cream-50">
            <p className="font-display text-3xl leading-snug">
              &ldquo;A table, a cup, and nowhere else to be.&rdquo;
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cream-200/70">
              CafeBook · Indiranagar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
