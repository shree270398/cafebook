import { z } from 'zod'
import { dateField } from './auth.validator.js'

export const MENU_CATEGORIES = [
  'Coffee',
  'Tea',
  'Cold Drinks',
  'Breakfast',
  'Mains',
  'Desserts',
  'Snacks',
]

const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'completed']

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.union([z.string().trim().url('Enter a valid image URL.'), z.null()]).optional(),
)

export const updateBookingStatusSchema = z.object({
  status: z.enum(bookingStatuses, {
    errorMap: () => ({ message: 'Choose a valid booking status.' }),
  }),
})

export const adminBookingsQuerySchema = z.object({
  status: z.enum(bookingStatuses).optional(),
  date: dateField.optional(),
})

export const createTableSchema = z.object({
  cafeId: z.string().uuid().optional(),
  tableNumber: z.coerce
    .number()
    .int()
    .min(1, 'Table number must be at least 1.')
    .max(999, 'Table number is too large.'),
  capacity: z.coerce
    .number()
    .int()
    .min(1, 'Capacity must be at least 1.')
    .max(20, 'Capacity cannot exceed 20.'),
  isActive: z.boolean().optional(),
})

export const updateTableSchema = z
  .object({
    tableNumber: z.coerce.number().int().min(1).max(999).optional(),
    capacity: z.coerce.number().int().min(1).max(20).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  })

export const createMenuItemSchema = z.object({
  cafeId: z.string().uuid().optional(),
  itemName: z.string().trim().min(2, 'Item name is required.').max(100),
  description: z.string().trim().max(500).optional().default(''),
  price: z.coerce
    .number()
    .min(0, 'Price cannot be negative.')
    .max(100000, 'Price is too large.'),
  category: z.enum(MENU_CATEGORIES, {
    errorMap: () => ({ message: 'Choose a valid category.' }),
  }),
  imageUrl: optionalUrl,
  isAvailable: z.boolean().optional(),
})

export const updateMenuItemSchema = z
  .object({
    itemName: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    price: z.coerce.number().min(0).max(100000).optional(),
    category: z.enum(MENU_CATEGORIES).optional(),
    imageUrl: optionalUrl,
    isAvailable: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  })
