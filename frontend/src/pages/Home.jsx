import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Coffee,
  HeartHandshake,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import MenuCard from '../components/MenuCard.jsx'
import { getCafes, getMenu } from '../services/cafeService.js'
import { getErrorMessage } from '../services/api.js'
import { formatTime } from '../utils/format.js'

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80'
const ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80'
const CTA_IMAGE =
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1800&q=80'

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Booked in a minute',
    description:
      'Pick a date, a time and the table that suits your group. No phone calls, no waiting.',
  },
  {
    icon: Users,
    title: 'A seat that fits',
    description:
      'Tables for two, four, six or eight — with every reservation checked against real capacity.',
  },
  {
    icon: ShieldCheck,
    title: 'No double bookings',
    description:
      'Every slot is protected at the database level, so two people can never claim the same table.',
  },
  {
    icon: HeartHandshake,
    title: 'Plans change, we get it',
    description:
      'Cancel any upcoming reservation in two taps and release the table for someone else.',
  },
]

function MenuSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-3xl border border-coffee-900/10 bg-white">
          <div className="skeleton aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [cafe, setCafe] = useState(null)
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const cafes = await getCafes()
        if (!cafes.length) {
          throw new Error('No cafe is available right now.')
        }
        const items = await getMenu(cafes[0].id)
        if (active) {
          setCafe(cafes[0])
          setMenu(items)
        }
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(
              err,
              'The cafe is taking a short break. Please refresh in a moment.',
            ),
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const featured = menu.filter((item) => item.is_available).slice(0, 4)
  const hours = cafe
    ? `${formatTime(cafe.opening_time)} – ${formatTime(cafe.closing_time)}`
    : '10:00 AM – 10:00 PM'
  const facilities = cafe?.facilities?.slice(0, 4) || [
    'Free Wi-Fi',
    'Outdoor seating',
    'Pet friendly',
    'Card & UPI payments',
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-caramel/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-coffee-200/30 blur-3xl" />

        <div className="container-page relative grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-coffee-900/10 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-coffee-600">
              <Sparkles className="h-3.5 w-3.5 text-caramel" />
              Neighbourhood cafe · Bengaluru
            </p>

            <h1 className="mt-6 text-5xl leading-[1.05] text-coffee-900 sm:text-6xl lg:text-[4.2rem]">
              Slow mornings.
              <br />
              Warm brews.
              <br />
              <span className="italic text-caramel">A table that&apos;s yours.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-coffee-500 sm:text-lg">
              Tucked away in Indiranagar, CafeBook is where small-batch coffee
              meets unhurried afternoons. Reserve your corner in under a minute
              — we&apos;ll keep the seat warm.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/book" size="lg">
                Reserve a table <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/menu" variant="outline" size="lg">
                Explore the menu
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-coffee-500">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-caramel" /> Open daily, {hours}
              </span>
              <span className="inline-flex items-center gap-2">
                <Coffee className="h-4 w-4 text-caramel" /> 10 tables · up to 8 guests
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -right-5 -top-5 h-40 w-40 rounded-full bg-caramel/15 blur-2xl" />
            <SmartImage
              src={cafe?.image_url || FALLBACK_HERO}
              alt="Warm, light-filled interior of CafeBook"
              className="aspect-[4/5] w-full rounded-[2.5rem] shadow-soft"
              imgClassName="object-cover"
              loading="eager"
            />

            <div className="absolute -left-3 bottom-6 rounded-2xl border border-coffee-900/10 bg-cream-50/95 p-4 shadow-card backdrop-blur sm:-left-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-cream-50">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-400">
                    Open today
                  </p>
                  <p className="text-sm font-semibold text-coffee-900">{hours}</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 top-6 hidden rounded-2xl border border-coffee-900/10 bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-400">
                Small batch
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-coffee-900">
                <Leaf className="h-3.5 w-3.5 text-emerald-600" /> Roasted weekly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="grid grid-cols-2 gap-4">
          <SmartImage
            src={ABOUT_IMAGE}
            alt="A barista pouring a fresh cup of coffee"
            className="aspect-[3/4] rounded-3xl"
          />
          <div className="flex flex-col gap-4 pt-10">
            <SmartImage
              src={cafe?.image_url || FALLBACK_HERO}
              alt="CafeBook seating and plants"
              className="aspect-square rounded-3xl"
            />
            <div className="rounded-3xl bg-espresso p-5 text-cream-50">
              <Coffee className="h-5 w-5 text-caramel" />
              <p className="mt-3 font-display text-xl leading-snug">
                Roasted in small batches, every single week.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="mt-3 text-3xl leading-tight text-coffee-900 sm:text-4xl">
            A room that feels like a deep breath.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-coffee-500 sm:text-base">
            We built CafeBook around one simple idea: a cafe should feel like a
            pause, not a pit stop. That means warm light, soft music, plants in
            every corner and coffee we actually care about.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-coffee-500 sm:text-base">
            Whether you are here for a first date, a slow breakfast or an
            afternoon of work, there is a table with your name on it.
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {facilities.map((facility) => (
              <li key={facility} className="flex items-center gap-2 text-sm text-coffee-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {facility}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button as={Link} to="/cafe" variant="secondary">
              More about the cafe
            </Button>
            <Button as={Link} to="/book" variant="ghost">
              Reserve a table <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured menu */}
      <section className="bg-cream-100/70 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="From the kitchen"
            title="A few favourites, freshly made"
            description="Coffee pulled to order, breakfast served all morning and desserts worth staying for."
            action={
              <Button as={Link} to="/menu" variant="secondary" size="sm">
                View full menu <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />

          <div className="mt-9">
            {loading ? (
              <MenuSkeleton />
            ) : error ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
                <p className="text-sm font-medium text-amber-900">{error}</p>
                <p className="mt-1 text-xs text-amber-700">
                  The menu will appear here once the cafe is connected.
                </p>
              </div>
            ) : featured.length === 0 ? (
              <div className="rounded-3xl border border-coffee-900/10 bg-white px-6 py-10 text-center text-sm text-coffee-500">
                The menu is being updated. Check back shortly.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why CafeBook */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Why CafeBook"
          title="Reservations that actually work"
          description="Built for the way people really book — quickly, from a phone, with the confidence that the table will still be there."
          align="center"
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-coffee-900/10 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-100 text-coffee-700">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl text-coffee-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-coffee-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <SmartImage
            src={CTA_IMAGE}
            alt="CafeBook tables waiting for guests"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-espresso/75" />
          <div className="relative flex flex-col items-center px-6 py-20 text-center text-cream-50 sm:px-12 sm:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cream-200/70">
              Reservations open
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
              Your table is waiting.
              <br />
              <span className="italic text-cream-200">Keep it warm.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream-200/80 sm:text-base">
              Pick a time, choose your table and get a booking reference
              instantly. Coffee is on us to pour.
            </p>
            <Button as={Link} to="/book" variant="white" size="lg" className="mt-8">
              Reserve your table <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Come say hello"
          title="Find your way to us"
          description="We are a short walk from Indiranagar metro, with outdoor seating for the days that deserve it."
        />

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-coffee-900/10 bg-white p-6 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-100 text-coffee-700">
              <Clock className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-xl">Opening hours</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-coffee-900/5 pb-2.5">
                <dt className="text-coffee-500">Monday – Friday</dt>
                <dd className="font-medium text-coffee-900">{hours}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-coffee-500">Saturday – Sunday</dt>
                <dd className="font-medium text-coffee-900">{hours}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-coffee-400">
              Kitchen closes 30 minutes before the cafe.
            </p>
          </div>

          <div className="rounded-3xl border border-coffee-900/10 bg-white p-6 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-100 text-coffee-700">
              <MapPin className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-xl">Visit us</h3>
            <p className="mt-3 text-sm leading-relaxed text-coffee-500">
              {cafe?.address || '24, 5th Cross, Indiranagar, Bengaluru 560038'}
            </p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                cafe?.address || 'Indiranagar, Bengaluru',
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-coffee-900 underline-offset-4 hover:underline"
            >
              Get directions <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="rounded-3xl border border-coffee-900/10 bg-white p-6 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-100 text-coffee-700">
              <Phone className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-xl">Call or write</h3>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href={`tel:${(cafe?.phone || '+919876543210').replace(/\s/g, '')}`}
                className="block text-coffee-500 transition hover:text-coffee-900"
              >
                {cafe?.phone || '+91 98765 43210'}
              </a>
              <a
                href={`mailto:${cafe?.email || 'hello@cafebook.in'}`}
                className="block text-coffee-500 transition hover:text-coffee-900"
              >
                {cafe?.email || 'hello@cafebook.in'}
              </a>
            </div>
            <p className="mt-4 text-xs text-coffee-400">
              For groups over 8, give us a call and we will arrange the room.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
