import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Armchair,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { PageLoader } from '../components/ui/Spinner.jsx'
import { useToast } from '../hooks/useToast.js'
import { getCafe, getCafes } from '../services/cafeService.js'
import { createBooking, getAvailability } from '../services/bookingService.js'
import { getErrorMessage } from '../services/api.js'
import {
  addDaysISO,
  formatDateLong,
  formatTime,
  slotPeriod,
  todayISO,
} from '../utils/format.js'

const STEPS = [
  { id: 1, label: 'Choose a time' },
  { id: 2, label: 'Pick a table' },
  { id: 3, label: 'Confirm' },
]

function FormAlert({ message }) {
  if (!message) return null
  return (
    <div className="flex gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

function Stepper({ step }) {
  return (
    <div className="flex flex-wrap items-center gap-y-3">
      {STEPS.map((item, index) => {
        const done = step > item.id
        const active = step === item.id
        return (
          <div key={item.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-emerald-600 text-white'
                    : active
                      ? 'bg-espresso text-cream-50'
                      : 'bg-cream-200 text-coffee-500'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : item.id}
              </span>
              <span
                className={`text-xs font-semibold ${
                  active ? 'text-coffee-900' : 'text-coffee-400'
                }`}
              >
                {item.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={`mx-3 h-px w-6 sm:w-10 ${
                  done ? 'bg-emerald-400' : 'bg-coffee-900/15'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function BookTable() {
  const toast = useToast()
  const [cafe, setCafe] = useState(null)
  const [loadingCafe, setLoadingCafe] = useState(true)
  const [cafeError, setCafeError] = useState('')

  const [step, setStep] = useState(1)
  const [date, setDate] = useState(todayISO())
  const [guests, setGuests] = useState(2)
  const [startTime, setStartTime] = useState('')
  const [availability, setAvailability] = useState(null)
  const [selectedTable, setSelectedTable] = useState('')
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoadingCafe(true)
      setCafeError('')
      try {
        const cafes = await getCafes()
        if (!cafes.length) throw new Error('No cafe is available right now.')
        const data = await getCafe(cafes[0].id)
        if (active) setCafe(data)
      } catch (err) {
        if (active) setCafeError(getErrorMessage(err, 'Could not load the cafe.'))
      } finally {
        if (active) setLoadingCafe(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const groupedSlots = useMemo(() => {
    const groups = { Morning: [], Afternoon: [], Evening: [] }
    const isToday = date === todayISO()
    const now = new Date()

    for (const slot of cafe?.time_slots || []) {
      if (isToday) {
        const [hour, minute] = slot.startTime.split(':').map(Number)
        if (hour * 60 + minute <= now.getHours() * 60 + now.getMinutes()) continue
      }
      groups[slotPeriod(slot.startTime)].push(slot)
    }

    return groups
  }, [cafe, date])

  const hasSlots = Object.values(groupedSlots).some((slots) => slots.length > 0)
  const selectedTableData = availability?.tables?.find(
    (table) => table.id === selectedTable,
  )

  const fetchAvailability = async () => {
    if (!cafe) return
    setLoadingAvailability(true)
    setAvailabilityError('')
    setSelectedTable('')
    try {
      const data = await getAvailability({
        cafeId: cafe.id,
        date,
        time: startTime,
        guests,
      })
      setAvailability(data)
    } catch (err) {
      setAvailability(null)
      setAvailabilityError(
        getErrorMessage(err, 'Could not check availability. Please try again.'),
      )
    } finally {
      setLoadingAvailability(false)
    }
  }

  const goToTables = async (event) => {
    event?.preventDefault()
    setFormError('')

    if (!date) {
      setFormError('Choose a date for your visit.')
      return
    }
    if (!startTime) {
      setFormError('Choose a time slot.')
      return
    }

    setStep(2)
    await fetchAvailability()
  }

  const goToConfirm = () => {
    if (!selectedTable) {
      setFormError('Choose a table to continue.')
      return
    }
    setFormError('')
    setStep(3)
  }

  const confirmBooking = async () => {
    setSubmitting(true)
    setFormError('')

    try {
      const result = await createBooking({
        cafeId: cafe.id,
        tableId: selectedTable,
        bookingDate: date,
        startTime,
        guests,
      })
      setBooking(result.booking)
      setStep(4)
      toast.success('Reservation created. Check your bookings for the reference.')
    } catch (err) {
      const message = getErrorMessage(err, 'Could not complete the reservation.')
      setFormError(message)
      if (err?.response?.status === 409) {
        toast.error(message)
        setStep(2)
        await fetchAvailability()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const startAnother = () => {
    setBooking(null)
    setStep(1)
    setSelectedTable('')
    setAvailability(null)
    setStartTime('')
    setGuests(2)
    setDate(todayISO())
    setFormError('')
  }

  if (loadingCafe) return <PageLoader label="Setting the table…" />

  if (cafeError || !cafe) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Coffee}
          title="The booking page is not available"
          description={cafeError || 'Please try again in a moment.'}
          action={
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  if (step === 4 && booking) {
    return (
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <p className="eyebrow mt-6">Reservation received</p>
          <h1 className="mt-3 text-3xl text-coffee-900 sm:text-4xl">
            Your table is being held.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-coffee-500">
            We have sent your request to the cafe. Your booking reference is
            below — keep it handy when you arrive.
          </p>

          <div className="mt-7 rounded-3xl border border-dashed border-coffee-900/25 bg-cream-100 px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-coffee-400">
              Booking reference
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.14em] text-coffee-900">
              {booking.booking_reference}
            </p>
          </div>

          <div className="mt-6 grid gap-3 rounded-3xl border border-coffee-900/10 bg-white p-6 text-left shadow-card sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-400">
                Date
              </p>
              <p className="mt-1 text-sm font-medium text-coffee-900">
                {formatDateLong(booking.booking_date)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-400">
                Time
              </p>
              <p className="mt-1 text-sm font-medium text-coffee-900">
                {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-400">
                Guests
              </p>
              <p className="mt-1 text-sm font-medium text-coffee-900">
                {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-400">
                Table
              </p>
              <p className="mt-1 text-sm font-medium text-coffee-900">
                Table {booking.cafe_tables?.table_number} ·{' '}
                {booking.cafe_tables?.capacity} seats
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-400">
                Status
              </p>
              <StatusBadge status={booking.status} className="mt-1.5" />
            </div>
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/bookings">
              View my bookings <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={startAnother}>
              Book another table
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow">Reservations</p>
        <h1 className="mt-3 text-4xl text-coffee-900 sm:text-5xl">Reserve your table.</h1>
        <p className="mt-3 text-sm leading-relaxed text-coffee-500 sm:text-base">
          Choose a time, pick the table that suits your group and we will take
          care of the rest. Each reservation holds your table for 90 minutes.
        </p>
      </div>

      <div className="mt-8">
        <Stepper step={step} />
      </div>

      <div className="mt-8 grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div className="surface p-5 sm:p-7">
          {step === 1 && (
            <form onSubmit={goToTables}>
              <h2 className="text-2xl text-coffee-900">When are you coming?</h2>
              <p className="mt-1 text-sm text-coffee-500">
                We are open every day, {formatTime(cafe.opening_time)} to{' '}
                {formatTime(cafe.closing_time)}.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Date"
                  type="date"
                  icon={CalendarDays}
                  min={todayISO()}
                  max={addDaysISO(60)}
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value)
                    setStartTime('')
                  }}
                  required
                />

                <Field
                  label="Guests"
                  as="select"
                  icon={Users}
                  value={guests}
                  onChange={(event) => setGuests(Number(event.target.value))}
                >
                  {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-coffee-600">
                  Available times
                </p>

                {!hasSlots ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                    There are no more slots for this date. Try tomorrow.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(groupedSlots).map(([period, slots]) =>
                      slots.length === 0 ? null : (
                        <div key={period}>
                          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-coffee-400">
                            {period}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {slots.map((slot) => (
                              <button
                                key={slot.startTime}
                                type="button"
                                onClick={() => setStartTime(slot.startTime)}
                                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                                  startTime === slot.startTime
                                    ? 'border-espresso bg-espresso text-cream-50 shadow-soft'
                                    : 'border-coffee-900/10 bg-white text-coffee-700 hover:border-coffee-900/35'
                                }`}
                              >
                                {formatTime(slot.startTime)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <FormAlert message={formError} />
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" size="lg">
                  Check availability <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl text-coffee-900">Choose your table.</h2>
                  <p className="mt-1 text-sm text-coffee-500">
                    {formatDateLong(date)} · {formatTime(startTime)} · {guests}{' '}
                    {guests === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change time
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAvailability}
                    loading={loadingAvailability}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                </div>
              </div>

              {availabilityError && (
                <div className="mt-5">
                  <FormAlert message={availabilityError} />
                </div>
              )}

              {loadingAvailability ? (
                <div className="mt-10 flex flex-col items-center gap-3 py-10">
                  <RefreshCw className="h-6 w-6 animate-spin text-caramel" />
                  <p className="text-sm text-coffee-500">Checking the floor plan…</p>
                </div>
              ) : availability ? (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {availability.tables.map((table) => {
                      const selected = selectedTable === table.id
                      const reason = !table.capacity_ok
                        ? 'Too small'
                        : !table.is_available
                          ? 'Booked'
                          : 'Available'

                      return (
                        <button
                          key={table.id}
                          type="button"
                          disabled={!table.is_available}
                          onClick={() => setSelectedTable(table.id)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            selected
                              ? 'border-espresso bg-espresso text-cream-50 shadow-soft'
                              : 'border-coffee-900/10 bg-white hover:border-coffee-900/30'
                          } ${
                            !table.is_available
                              ? 'cursor-not-allowed opacity-55 hover:border-coffee-900/10'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display text-2xl">
                              Table {table.table_number}
                            </span>
                            <Armchair
                              className={`h-5 w-5 ${
                                selected ? 'text-caramel' : 'text-coffee-400'
                              }`}
                            />
                          </div>
                          <p
                            className={`mt-1 inline-flex items-center gap-1.5 text-xs ${
                              selected ? 'text-cream-200/80' : 'text-coffee-500'
                            }`}
                          >
                            <Users className="h-3.5 w-3.5" /> Seats {table.capacity}
                          </p>
                          <span
                            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                              selected
                                ? 'bg-white/15 text-cream-50'
                                : table.is_available
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-cream-200 text-coffee-500'
                            }`}
                          >
                            {reason}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {availability.tables.every((table) => !table.is_available) && (
                    <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Every table is taken for this slot. Try a different time.
                    </p>
                  )}
                </>
              ) : null}

              <div className="mt-6">
                <FormAlert message={formError} />
              </div>

              <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={goToConfirm} disabled={!selectedTable} size="lg">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl text-coffee-900">Confirm your reservation.</h2>
              <p className="mt-1 text-sm text-coffee-500">
                One last look before we hold the table.
              </p>

              <dl className="mt-6 divide-y divide-coffee-900/5 rounded-2xl border border-coffee-900/10 bg-cream-100/60 px-5">
                {[
                  { label: 'Date', value: formatDateLong(date) },
                  {
                    label: 'Time',
                    value: availability
                      ? `${formatTime(availability.startTime)} – ${formatTime(availability.endTime)}`
                      : formatTime(startTime),
                  },
                  { label: 'Guests', value: `${guests} ${guests === 1 ? 'guest' : 'guests'}` },
                  {
                    label: 'Table',
                    value: selectedTableData
                      ? `Table ${selectedTableData.table_number} · ${selectedTableData.capacity} seats`
                      : '—',
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-coffee-400">
                      {row.label}
                    </dt>
                    <dd className="text-right text-sm font-medium text-coffee-900">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex gap-2.5 rounded-2xl border border-coffee-900/10 bg-white px-4 py-3 text-xs leading-relaxed text-coffee-500">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
                <p>
                  Your table is held for 90 minutes. The booking starts as{' '}
                  <span className="font-semibold text-coffee-900">pending</span> and the
                  cafe will confirm it. You can cancel free of charge from My
                  bookings before it starts.
                </p>
              </div>

              <div className="mt-5">
                <FormAlert message={formError} />
              </div>

              <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={confirmBooking} loading={submitting} size="lg">
                  Confirm reservation <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-3xl border border-coffee-900/10 bg-white shadow-card">
            <SmartImage
              src={cafe.image_url}
              alt={`Inside ${cafe.name}`}
              className="aspect-[16/10] w-full"
            />
            <div className="p-5">
              <h3 className="font-display text-xl text-coffee-900">{cafe.name}</h3>
              <p className="mt-1.5 flex gap-2 text-xs leading-relaxed text-coffee-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-caramel" />
                {cafe.address}
              </p>
              <p className="mt-2 flex gap-2 text-xs text-coffee-500">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-caramel" />
                Open daily, {formatTime(cafe.opening_time)} –{' '}
                {formatTime(cafe.closing_time)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-coffee-900/10 bg-cream-100 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-400">
              Your selection
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-coffee-500">Date</span>
                <span className="font-medium text-coffee-900">
                  {date ? formatDateLong(date) : 'Not chosen'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-coffee-500">Time</span>
                <span className="font-medium text-coffee-900">
                  {startTime ? formatTime(startTime) : 'Not chosen'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-coffee-500">Guests</span>
                <span className="font-medium text-coffee-900">{guests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-coffee-500">Table</span>
                <span className="font-medium text-coffee-900">
                  {selectedTableData ? selectedTableData.table_number : 'Not chosen'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-espresso p-5 text-cream-50">
            <Coffee className="h-5 w-5 text-caramel" />
            <p className="mt-3 font-display text-lg leading-snug">
              Running late? Give us a call and we will hold your table a little
              longer.
            </p>
            <p className="mt-2 text-xs text-cream-200/60">{cafe.phone}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
