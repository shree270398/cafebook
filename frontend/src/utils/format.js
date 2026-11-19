const DAY_MS = 24 * 60 * 60 * 1000

function localISO(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function todayISO() {
  return localISO(new Date())
}

export function addDaysISO(days) {
  return localISO(new Date(Date.now() + days * DAY_MS))
}

export function formatTime(time) {
  if (!time) return ''
  const [hourString, minuteString] = String(time).split(':')
  const hour = Number(hourString)
  const minute = Number(minuteString)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`
}

export function parseLocalDate(dateString) {
  if (!dateString) return null
  const [year, month, day] = String(dateString).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function bookingStart(booking) {
  const date = parseLocalDate(booking.booking_date)
  if (!date) return null
  const [hour, minute] = String(booking.start_time).split(':').map(Number)
  date.setHours(hour, minute, 0, 0)
  return date
}

export function formatDate(dateString, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const date = parseLocalDate(dateString)
  if (!date) return ''
  return new Intl.DateTimeFormat('en-IN', options).format(date)
}

export function formatDateLong(dateString) {
  return formatDate(dateString, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function dayNumber(dateString) {
  const date = parseLocalDate(dateString)
  return date ? date.getDate() : ''
}

export function monthShort(dateString) {
  const date = parseLocalDate(dateString)
  return date
    ? new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date)
    : ''
}

export function formatCurrency(value) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function initials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'C'
  )
}

export function isActiveStatus(status) {
  return status === 'pending' || status === 'confirmed'
}

export function isUpcomingBooking(booking) {
  const start = bookingStart(booking)
  return isActiveStatus(booking.status) && start && start.getTime() > Date.now()
}

export function isCancellable(booking) {
  return isUpcomingBooking(booking)
}

export function slotPeriod(time) {
  const hour = Number(String(time).split(':')[0])
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}
