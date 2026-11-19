import { useId } from 'react'

export default function Field({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  as = 'input',
  className = '',
  children,
  id,
  ...props
}) {
  const generatedId = useId()
  const fieldId = id || props.name || generatedId
  const Component = as

  const classes = `input-base ${Icon ? 'pl-11' : ''} ${
    rightElement ? 'pr-12' : ''
  } ${
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : ''
  }`

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-coffee-600"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
        )}

        <Component id={fieldId} className={classes} {...props}>
          {children}
        </Component>

        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-coffee-400">{hint}</p>
      ) : null}
    </div>
  )
}
