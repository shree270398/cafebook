import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { getErrorMessage } from '../services/api.js'
import { formatDate, initials } from '../utils/format.js'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ fullName: user?.full_name || '', phone: user?.phone || '' })
  }, [user])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [event.target.name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    if (form.fullName.trim().length < 2) {
      setFieldErrors({ fullName: 'Enter your full name.' })
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
      })
      toast.success('Profile updated.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update your profile.'))
      const serverErrors = err?.response?.data?.errors
      if (serverErrors) setFieldErrors(serverErrors)
    } finally {
      setSaving(false)
    }
  }

  const errorFor = (field) => {
    const value = fieldErrors[field]
    return Array.isArray(value) ? value[0] : value
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow">Your account</p>
        <h1 className="mt-3 text-4xl text-coffee-900 sm:text-5xl">Profile.</h1>
        <p className="mt-3 text-sm leading-relaxed text-coffee-500 sm:text-base">
          Keep your contact details up to date so we can reach you about a
          reservation.
        </p>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="surface overflow-hidden">
          <div className="bg-espresso px-6 py-8 text-cream-50">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 font-display text-2xl font-semibold text-espresso">
              {initials(user?.full_name)}
            </span>
            <h2 className="mt-4 text-2xl">{user?.full_name}</h2>
            <p className="mt-1 text-sm text-cream-200/70">{user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream-100">
                {user?.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream-100">
                Member since {formatDate(String(user?.created_at || '').slice(0, 10))}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-6 text-sm">
            <p className="flex items-center gap-3 text-coffee-600">
              <Mail className="h-4 w-4 text-caramel" />
              <span className="truncate">{user?.email}</span>
            </p>
            <p className="flex items-center gap-3 text-coffee-600">
              <Phone className="h-4 w-4 text-caramel" />
              {user?.phone || 'No phone number added yet'}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button as={Link} to="/bookings" variant="secondary" size="sm">
                <CalendarDays className="h-4 w-4" /> My bookings
              </Button>
              {user?.role === 'admin' && (
                <Button as={Link} to="/admin" variant="outline" size="sm">
                  <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="surface p-6 sm:p-8">
          <h2 className="text-2xl text-coffee-900">Edit your details</h2>
          <p className="mt-1 text-sm text-coffee-500">
            Your name appears on the reservation. The phone number helps the cafe
            reach you if anything changes.
          </p>

          {error && (
            <div className="mt-5 flex gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Field
              label="Full name"
              name="fullName"
              icon={User}
              value={form.fullName}
              onChange={handleChange}
              error={errorFor('fullName')}
              required
            />

            <Field
              label="Phone number"
              name="phone"
              type="tel"
              icon={Phone}
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              error={errorFor('phone')}
              hint="Optional, but useful on the day of your reservation."
            />

            <Field
              label="Email address"
              name="email"
              icon={Mail}
              value={user?.email || ''}
              disabled
              hint="Email changes are handled by the cafe team."
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-1.5 text-xs text-coffee-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Your details are only visible to you and the cafe.
              </p>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
