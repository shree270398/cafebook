import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  Eye,
  EyeOff,
  HeartHandshake,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { getErrorMessage } from '../services/api.js'

const IMAGE =
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80'

const BENEFITS = [
  {
    icon: CalendarCheck,
    text: 'Reserve a table in under a minute, any day of the week.',
  },
  {
    icon: HeartHandshake,
    text: 'Plans changed? Cancel upcoming bookings yourself.',
  },
  {
    icon: Lock,
    text: 'Your details stay private and your bookings stay yours.',
  },
]

export default function Register() {
  const { user, loading, register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/book'

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  const errorFor = (field) => {
    const value = fieldErrors[field]
    return Array.isArray(value) ? value[0] : value
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    const nextErrors = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const data = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
      })

      if (data.session) {
        toast.success('Welcome to CafeBook. Pick a table — it is on us to keep warm.')
        navigate(from, { replace: true })
      } else {
        toast.info('Account created. Please sign in to continue.')
        navigate('/login', { state: { from } })
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create the account.'))
      const serverErrors = err?.response?.data?.errors
      if (serverErrors) setFieldErrors(serverErrors)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-coffee-900/10 bg-white shadow-soft lg:grid-cols-2">
        <div className="p-6 sm:p-10 lg:p-12">
          <p className="eyebrow">Join CafeBook</p>
          <h1 className="mt-3 text-3xl text-coffee-900 sm:text-4xl">
            Your corner is one step away.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-coffee-500">
            Create an account to reserve tables, manage bookings and keep your
            details in one place.
          </p>

          {error && (
            <div className="mt-6 flex gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Field
              label="Full name"
              name="fullName"
              autoComplete="name"
              icon={User}
              placeholder="Ananya Sharma"
              value={form.fullName}
              onChange={handleChange}
              error={errorFor('fullName')}
              required
            />

            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errorFor('email')}
              required
            />

            <Field
              label="Phone number"
              name="phone"
              type="tel"
              autoComplete="tel"
              icon={Phone}
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              error={errorFor('phone')}
              hint="Optional — used only if we need to reach you about a booking."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                icon={Lock}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                error={errorFor('password')}
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
                required
              />

              <Field
                label="Confirm password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                required
              />
            </div>

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-coffee-500">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from }}
              className="font-semibold text-coffee-900 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="relative hidden min-h-[600px] lg:block">
          <SmartImage
            src={IMAGE}
            alt="CafeBook interior with warm lighting"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/55 to-espresso/20" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-cream-50">
            <p className="font-display text-3xl leading-snug">
              A good table is worth keeping.
            </p>
            <ul className="mt-6 space-y-4">
              {BENEFITS.map((benefit) => (
                <li key={benefit.text} className="flex gap-3 text-sm text-cream-200/85">
                  <benefit.icon className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
                  <span className="leading-relaxed">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
