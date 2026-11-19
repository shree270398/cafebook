export const SLOT_DURATION_MINUTES = 90
export const SLOT_STEP_MINUTES = 30

/** Normalise "10:00", "10:00:00" -> "10:00:00". */
export function toTimeString(value) {
  if (!value) return null
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(value).trim())
  if (!match) return null
  return `${match[1]}:${match[2]}:${match[3] || '00'}`
}

/** Minutes since midnight for an "HH:MM[:SS]" string. */
export function toMinutes(time) {
  const normalised = toTimeString(time)
  if (!normalised) return null
  const [hours, minutes] = normalised.split(':').map(Number)
  return hours * 60 + minutes
}

/** Add minutes to "HH:MM[:SS]" and return "HH:MM:SS". */
export function addMinutes(time, minutesToAdd) {
  const base = toMinutes(time)
  if (base === null) return null
  const total = base + minutesToAdd
  if (total < 0 || total >= 24 * 60) return null
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}

/**
 * Build the bookable start times for a cafe.
 * A table is held for 90 minutes, and start times are every 30 minutes.
 */
export function buildTimeSlots(openingTime, closingTime) {
  const opening = toMinutes(openingTime)
  const closing = toMinutes(closingTime)
  if (opening === null || closing === null) return []

  const slots = []
  for (
    let start = opening;
    start + SLOT_DURATION_MINUTES <= closing;
    start += SLOT_STEP_MINUTES
  ) {
    const startTime = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(
      start % 60,
    ).padStart(2, '0')}:00`
    const endTime = addMinutes(startTime, SLOT_DURATION_MINUTES)
    slots.push({ startTime, endTime })
  }
  return slots
}

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** YYYY-MM-DD for a given IANA timezone (defaults to Asia/Kolkata). */
export function todayInTimezone(timezone = 'Asia/Kolkata') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function nowTimeInTimezone(timezone = 'Asia/Kolkata') {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}
