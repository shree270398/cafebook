import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  CreditCard,
  Leaf,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Wind,
  Wifi,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import { PageLoader } from '../components/ui/Spinner.jsx'
import { getCafe, getCafes } from '../services/cafeService.js'
import { getErrorMessage } from '../services/api.js'
import { formatTime } from '../utils/format.js'

const FACILITY_ICONS = {
  'Free Wi-Fi': Wifi,
  'Air conditioned': Wind,
  'Outdoor seating': Leaf,
  'Pet friendly': PawPrint,
  'Card & UPI payments': CreditCard,
  'Wheelchair accessible': Accessibility,
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function Cafe() {
  const [cafe, setCafe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const cafes = await getCafes()
        if (!cafes.length) throw new Error('No cafe is available right now.')
        const data = await getCafe(cafes[0].id)
        if (active) setCafe(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Could not load the cafe details.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <PageLoader label="Opening the doors…" />
  }

  if (error || !cafe) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Coffee}
          title="We could not open the cafe page"
          description={error || 'Please try again in a moment.'}
          action={
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  const hours = `${formatTime(cafe.opening_time)} – ${formatTime(cafe.closing_time)}`

  return (
    <div className="pb-4">
      <section className="container-page pt-10 sm:pt-14">
        <p className="eyebrow">Our cafe</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl leading-tight text-coffee-900 sm:text-5xl">
              {cafe.name}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-coffee-500 sm:text-base">
              {cafe.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 lg:pb-1">
            <Button as={Link} to="/book">
              Reserve a table
            </Button>
            <Button as={Link} to="/menu" variant="outline">
              See the menu
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page mt-8">
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <SmartImage
            src={cafe.image_url}
            alt={`Inside ${cafe.name}`}
            className="aspect-[16/10] w-full sm:aspect-[16/8]"
            loading="eager"
          />
          <div className="absolute bottom-5 left-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/20 bg-espresso/80 px-4 py-3 text-cream-50 backdrop-blur">
            <span className="inline-flex items-center gap-2 text-xs font-medium">
              <Clock className="h-4 w-4 text-caramel" /> Open daily, {hours}
            </span>
            <span className="hidden h-3 w-px bg-white/20 sm:block" />
            <span className="inline-flex items-center gap-2 text-xs font-medium">
              <MapPin className="h-4 w-4 text-caramel" /> Indiranagar
            </span>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="eyebrow">The space</p>
          <h2 className="mt-3 text-3xl text-coffee-900 sm:text-4xl">
            Light, plants and room to linger.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-coffee-500 sm:text-base">
            Our room was designed for long conversations and quiet corners.
            There is a communal table for laptop mornings, low seats for slow
            dates and a small garden out back for the days when the weather is
            kind.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-coffee-500 sm:text-base">
            Everything on the menu is made in-house — from the syrups in your
            coffee to the bread under your breakfast. If you have a favourite
            corner, tell us when you book and we will do our best.
          </p>

          <h3 className="mt-9 text-xl text-coffee-900">Facilities</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(cafe.facilities || []).map((facility) => {
              const Icon = FACILITY_ICONS[facility] || CheckCircle2
              return (
                <div
                  key={facility}
                  className="flex items-center gap-3 rounded-2xl border border-coffee-900/10 bg-white px-4 py-3 shadow-card"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-coffee-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-coffee-700">{facility}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-coffee-700">
                <Clock className="h-4 w-4" />
              </span>
              <h3 className="text-xl text-coffee-900">Opening hours</h3>
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-between border-b border-coffee-900/5 pb-2.5 last:border-0 last:pb-0"
                >
                  <dt className="text-coffee-500">{day}</dt>
                  <dd className="font-medium text-coffee-900">{hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface p-6">
            <h3 className="text-xl text-coffee-900">Find us</h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
                <span className="leading-relaxed text-coffee-600">{cafe.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
                <a
                  href={`tel:${String(cafe.phone || '').replace(/\s/g, '')}`}
                  className="text-coffee-600 transition hover:text-coffee-900"
                >
                  {cafe.phone || 'Call the cafe for directions'}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
                <a
                  href={`mailto:${cafe.email || ''}`}
                  className="text-coffee-600 transition hover:text-coffee-900"
                >
                  {cafe.email || 'Write to us'}
                </a>
              </li>
            </ul>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(cafe.address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-coffee-900 underline-offset-4 hover:underline"
            >
              Get directions <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="rounded-3xl bg-espresso p-6 text-cream-50">
            <p className="font-display text-2xl leading-snug">
              Planning something bigger?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream-200/70">
              Our largest table seats eight. For birthdays or team breakfasts,
              give us a ring and we will arrange the room.
            </p>
            <Button as={Link} to="/book" variant="white" size="sm" className="mt-5">
              Book a table
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
