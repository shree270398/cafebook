import { CalendarDays, Clock, Users, Armchair } from 'lucide-react'
import StatusBadge from './ui/StatusBadge.jsx'
import {
  dayNumber,
  formatDate,
  formatTime,
  isCancellable,
  monthShort,
} from '../utils/format.js'

export default function BookingCard({ booking, onCancel, className = '' }) {
  const cancellable = isCancellable(booking)
  const table = booking.cafe_tables

  return (
    <article
      className={`surface overflow-hidden transition hover:shadow-soft ${className}`}
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-espresso text-cream-50">
          <span className="text-[10px] uppercase tracking-[0.2em] text-cream-200/70">
            {monthShort(booking.booking_date)}
          </span>
          <span className="font-display text-3xl leading-none">
            {dayNumber(booking.booking_date)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={booking.status} />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-coffee-400">
              {booking.booking_reference}
            </span>
          </div>

          <h3 className="mt-2 text-xl text-coffee-900">
            {formatDate(booking.booking_date, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-coffee-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-caramel" />
              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-caramel" />
              {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Armchair className="h-3.5 w-3.5 text-caramel" />
              Table {table?.table_number ?? '—'}
              {table?.capacity ? ` · seats ${table.capacity}` : ''}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-coffee-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Booked {formatDate(String(booking.created_at).slice(0, 10))}
          </p>
          {cancellable && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking)}
              className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
