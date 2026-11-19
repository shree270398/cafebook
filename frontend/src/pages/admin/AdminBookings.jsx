import { useCallback, useEffect, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Coffee,
  RotateCcw,
  X,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Field from '../../components/ui/Field.jsx'
import Modal from '../../components/ui/Modal.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { useToast } from '../../hooks/useToast.js'
import { getBookings, updateBookingStatus } from '../../services/adminService.js'
import { getErrorMessage } from '../../services/api.js'
import { formatDate, formatTime } from '../../utils/format.js'

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed']

export default function AdminBookings() {
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getBookings({
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      })
      setBookings(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load bookings.'))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, dateFilter])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  const changeStatus = async (booking, status) => {
    setActionId(booking.id)
    try {
      const result = await updateBookingStatus(booking.id, status)
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? result.booking : item)),
      )
      toast.success(result.message || `Booking marked as ${status}.`)
      setCancelTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update the booking.'))
    } finally {
      setActionId('')
    }
  }

  const clearFilters = () => {
    setStatusFilter('')
    setDateFilter('')
  }

  return (
    <div>
      <AdminPageHeader
        title="Bookings"
        description="Approve requests, mark completed visits and cancel reservations. Every change is saved immediately."
        action={
          <Button variant="secondary" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="surface mt-6 flex flex-wrap items-end gap-3 p-4">
        <Field
          label="Status"
          as="select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </Field>

        <Field
          label="Date"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="w-full sm:w-48"
        />

        {(statusFilter || dateFilter) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}

        <p className="mb-2.5 ml-auto text-xs text-coffee-400">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </p>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="skeleton h-20" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Coffee}
            title="Could not load bookings"
            description={error}
            action={
              <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            }
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Coffee}
            title="No bookings match these filters"
            description="Try a different status or date, or clear the filters to see everything."
            action={
              (statusFilter || dateFilter) && (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <div className="surface overflow-hidden">
            <div className="hidden border-b border-coffee-900/5 bg-cream-100/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-400 lg:grid lg:grid-cols-[1.4fr_1fr_0.6fr_0.8fr_1.1fr] lg:gap-4">
              <span>Customer</span>
              <span>Reservation</span>
              <span>Party</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-coffee-900/5">
              {bookings.map((booking) => {
                const busy = actionId === booking.id
                const canConfirm = booking.status === 'pending'
                const canComplete = ['pending', 'confirmed'].includes(booking.status)
                const canCancel = ['pending', 'confirmed'].includes(booking.status)

                return (
                  <div
                    key={booking.id}
                    className="grid gap-3 px-5 py-4 lg:grid-cols-[1.4fr_1fr_0.6fr_0.8fr_1.1fr] lg:items-center lg:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-coffee-900">
                        {booking.profiles?.full_name || 'Guest'}
                      </p>
                      <p className="truncate text-xs text-coffee-400">
                        {booking.profiles?.email || '—'}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-coffee-400">
                        {booking.booking_reference}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-coffee-800">
                        {formatDate(booking.booking_date, {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-coffee-400">
                        {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-coffee-800">
                        {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                      </p>
                      <p className="text-xs text-coffee-400">
                        Table {booking.cafe_tables?.table_number ?? '—'}
                      </p>
                    </div>

                    <div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {canConfirm && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => changeStatus(booking, 'confirmed')}
                          disabled={busy || Boolean(actionId)}
                        >
                          <Check className="h-3.5 w-3.5" /> Confirm
                        </Button>
                      )}
                      {canComplete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => changeStatus(booking, 'completed')}
                          disabled={busy || Boolean(actionId)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setCancelTarget(booking)}
                          disabled={busy || Boolean(actionId)}
                        >
                          <X className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      )}
                      {!canConfirm && !canComplete && !canCancel && (
                        <span className="text-xs text-coffee-300">No actions</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => (actionId ? null : setCancelTarget(null))}
        title="Cancel this reservation?"
        description={
          cancelTarget
            ? `${cancelTarget.profiles?.full_name || 'Guest'} · ${formatDate(
                cancelTarget.booking_date,
              )} at ${formatTime(cancelTarget.start_time)}`
            : ''
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCancelTarget(null)}
              disabled={Boolean(actionId)}
            >
              Keep booking
            </Button>
            <Button
              variant="danger"
              loading={Boolean(actionId)}
              onClick={() => changeStatus(cancelTarget, 'cancelled')}
            >
              Cancel reservation
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-coffee-600">
          The customer will see the booking as cancelled and the table will become
          available for that slot again.
        </p>
      </Modal>
    </div>
  )
}
