import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Coffee, RotateCcw } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import BookingCard from '../components/BookingCard.jsx'
import { PageLoader } from '../components/ui/Spinner.jsx'
import { useToast } from '../hooks/useToast.js'
import { cancelBooking, getMyBookings } from '../services/bookingService.js'
import { getErrorMessage } from '../services/api.js'
import {
  bookingStart,
  formatDateLong,
  formatTime,
  isUpcomingBooking,
} from '../utils/format.js'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'all', label: 'All' },
]

function BookingSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-4 rounded-3xl border border-coffee-900/10 bg-white p-5">
          <div className="skeleton h-20 w-20 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-5 w-56" />
            <div className="skeleton h-3 w-72" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MyBookings() {
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyBookings()
      setBookings(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your bookings.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  const groups = useMemo(() => {
    const upcoming = bookings
      .filter(isUpcomingBooking)
      .sort((a, b) =>
        `${a.booking_date}${a.start_time}`.localeCompare(`${b.booking_date}${b.start_time}`),
      )
    const past = bookings.filter((booking) => {
      if (isUpcomingBooking(booking)) return false
      // A cancelled future reservation stays out of "Past" and is visible in "All".
      if (booking.status === 'cancelled') {
        const start = bookingStart(booking)
        return Boolean(start) && start.getTime() <= Date.now()
      }
      return true
    })
    return { upcoming, past, all: bookings }
  }, [bookings])

  const visible = groups[tab] || []

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelBooking(cancelTarget.id)
      toast.success('Booking cancelled. The table is available again.')
      setCancelTarget(null)
      setReloadKey((key) => key + 1)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel the booking.'))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Your reservations</p>
          <h1 className="mt-3 text-4xl text-coffee-900 sm:text-5xl">My bookings.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-coffee-500 sm:text-base">
            Everything you have booked, in one place. Cancel an upcoming table
            if plans change — we will release it for someone else.
          </p>
        </div>
        <Button as={Link} to="/book" className="shrink-0">
          Book a table
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-coffee-900/10 pb-4">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === item.key
                ? 'bg-espresso text-cream-50 shadow-soft'
                : 'border border-coffee-900/10 bg-white text-coffee-600 hover:border-coffee-900/30 hover:text-coffee-900'
            }`}
          >
            {item.label}
            <span className={`ml-1.5 ${tab === item.key ? 'text-cream-200/70' : 'text-coffee-400'}`}>
              {groups[item.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <BookingSkeleton />
        ) : error ? (
          <EmptyState
            icon={Coffee}
            title="We could not load your bookings"
            description={error}
            action={
              <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={
              tab === 'upcoming'
                ? 'No upcoming reservations'
                : tab === 'past'
                  ? 'Nothing in the past yet'
                  : 'No bookings yet'
            }
            description={
              tab === 'upcoming'
                ? 'Your next table will appear here. Pick a time and we will keep the seat warm.'
                : 'Once you have visited us, your reservation history will show up here.'
            }
            action={
              <Button as={Link} to="/book">
                Reserve a table
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {visible.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={(target) => setCancelTarget(target)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => (cancelling ? null : setCancelTarget(null))}
        title="Cancel this reservation?"
        description={
          cancelTarget
            ? `${formatDateLong(cancelTarget.booking_date)} at ${formatTime(
                cancelTarget.start_time,
              )}`
            : ''
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
            >
              Keep booking
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling}>
              Yes, cancel it
            </Button>
          </>
        }
      >
        <div className="rounded-2xl border border-coffee-900/10 bg-white p-4 text-sm leading-relaxed text-coffee-600">
          <p>
            The table will be released immediately and your booking reference{' '}
            <span className="font-mono text-xs font-semibold text-coffee-900">
              {cancelTarget?.booking_reference}
            </span>{' '}
            will be marked as cancelled.
          </p>
          <p className="mt-2 text-xs text-coffee-400">
            This action cannot be undone. You are welcome to book another table.
          </p>
        </div>
      </Modal>
    </div>
  )
}
