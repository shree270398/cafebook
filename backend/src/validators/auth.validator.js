import { z } from 'zod'
import { isValidDateString } from '../utils/time.js'

const phoneField = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z
    .string()
    .trim()
    .regex(/^[+0-9][0-9\s-]{6,19}$/, 'Enter a valid phone number.')
    .nullable()
    .optional(),
)

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name is too long.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password is too long.'),
  phone: phoneField,
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'A refresh token is required.'),
})

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80, 'Name is too long.')
      .optional(),
    phone: phoneField,
  })
  .refine((data) => data.fullName !== undefined || data.phone !== undefined, {
    message: 'Provide a name or phone number to update.',
  })

export const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date (YYYY-MM-DD).')
  .refine(isValidDateString, 'Use a valid calendar date.')

export const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Use a valid time (HH:MM).')

export const createBookingSchema = z.object({
  cafeId: z.string().uuid('Select a valid cafe.'),
  tableId: z.string().uuid('Select a valid table.'),
  bookingDate: dateField,
  startTime: timeField,
  guests: z.coerce
    .number()
    .int('Guest count must be a whole number.')
    .min(1, 'At least one guest is required.')
    .max(20, 'For larger groups, please call the cafe.'),
})

export const availabilityQuerySchema = z.object({
  cafeId: z.string().uuid('Select a valid cafe.'),
  date: dateField,
  time: timeField,
  guests: z.coerce.number().int().min(1).max(20).default(2),
})
