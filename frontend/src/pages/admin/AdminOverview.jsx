import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Armchair,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coffee,
  RotateCcw,
  Users,
  XCircle,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { getStats } from '../../services/adminService.js'
import { getErrorMessage } from '../../services/api.js'
import { formatDate, formatTime } from '../../utils/format.js'

const SKELETON_CARDS = 6

export default function AdminOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getStats()
      setData(result)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the dashboard.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  if (loading) {
    return (
      <div>
        <div className="skeleton h-10 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <div key={index} className="skeleton h-28" />
          ))}
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <div className="skeleton h-80" />
          <div className="skeleton h-80" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <AdminPageHeader title="Today at a glance" />
        <EmptyState
          className="mt-8"
          icon={Coffee}
          title="The dashboard is having a slow morning"
          description={error || 'Please try again in a moment.'}
          action={
            <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
          }
        />
      </div>
    )
  }

  const { stats, today, todayBookings, recentBookings } = data

  return (
    <div>
      <AdminPageHeader
        title="Today at a glance"
        description={`${
          today
            ? formatDate(today, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Today'
        } · ${todayBookings.length} ${
          todayBookings.length === 1 ? 'reservation' : 'reservations'
        } on the books.`}
        action={
          <Button variant="secondary" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total reservations" value={stats.total} icon={CalendarDays} tone="coffee" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} tone="pending" hint="Awaiting confirmation" />
        <StatCard label="Confirmed" value={stats.confirmed} icon={CheckCircle2} tone="confirmed" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} tone="cancelled" />
        <StatCard label="Customers" value={stats.customers} icon={Users} />
        <StatCard label="Active tables" value={stats.tables} icon={Armchair} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-coffee-900/5 px-5 py-4">
            <div>
              <h2 className="text-xl text-coffee-900">Today&apos;s schedule</h2>
              <p className="mt-0.5 text-xs text-coffee-400">
                Every table booked for today, in time order.
              </p>
            </div>
            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-coffee-700 hover:text-coffee-900"
            >
              All bookings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {todayBookings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-coffee-700">No reservations today.</p>
              <p className="mt-1 text-xs text-coffee-400">
                A quiet room — or a good day to invite someone in.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-coffee-900/5">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-xs font-semibold text-coffee-800">
                    {formatTime(booking.start_time)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-coffee-900">
                      {booking.profiles?.full_name || 'Guest'}
                    </p>
                    <p className="truncate text-xs text-coffee-400">
                      Table {booking.cafe_tables?.table_number ?? '—'} ·{' '}
                      {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="surface overflow-hidden">
            <div className="border-b border-coffee-900/5 px-5 py-4">
              <h2 className="text-xl text-coffee-900">Recent activity</h2>
              <p className="mt-0.5 text-xs text-coffee-400">The latest bookings to come in.</p>
            </div>
            {recentBookings.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-coffee-400">
                New bookings will appear here.
              </p>
            ) : (
              <div className="divide-y divide-coffee-900/5">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-[10px] font-semibold text-coffee-700">
                      {String(booking.profiles?.full_name || 'G')
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-coffee-800">
                        {booking.profiles?.full_name || 'Guest'}
                      </p>
                      <p className="truncate text-[11px] text-coffee-400">
                        {formatDate(booking.booking_date)} · {formatTime(booking.start_time)}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-espresso p-5 text-cream-50">
            <h2 className="text-xl">Quick actions</h2>
            <p className="mt-1 text-xs text-cream-200/60">
              Jump straight to the part of the cafe you need.
            </p>
            <div className="mt-4 grid gap-2">
              <Button as={Link} to="/admin/bookings" variant="white" size="sm">
                Manage bookings
              </Button>
              <Button
                as={Link}
                to="/admin/tables"
                variant="outline"
                size="sm"
                className="border-white/25 text-cream-50 hover:border-white hover:bg-white/10"
              >
                Edit the floor plan
              </Button>
              <Button
                as={Link}
                to="/admin/menu"
                variant="outline"
                size="sm"
                className="border-white/25 text-cream-50 hover:border-white hover:bg-white/10"
              >
                Update the menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
