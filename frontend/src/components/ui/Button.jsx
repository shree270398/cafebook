import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-espresso text-cream-50 shadow-soft hover:bg-coffee-800 focus-visible:ring-espresso/30',
  secondary:
    'bg-cream-100 text-coffee-900 border border-coffee-900/10 hover:bg-cream-200 focus-visible:ring-coffee-900/20',
  outline:
    'border border-coffee-900/25 text-coffee-900 hover:border-coffee-900 hover:bg-cream-100 focus-visible:ring-coffee-900/20',
  ghost: 'text-coffee-700 hover:bg-cream-100 focus-visible:ring-coffee-900/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300',
  white: 'bg-cream-50 text-espresso hover:bg-white focus-visible:ring-white/50',
}

const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-7 py-3.5 text-sm',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  const isButton = Component === 'button'
  const isDisabled = disabled || loading

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${
        isDisabled ? 'pointer-events-none opacity-60' : ''
      } ${className}`}
      {...(isButton ? { type, disabled: isDisabled } : {})}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Component>
  )
}
