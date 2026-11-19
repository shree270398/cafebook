import { Coffee } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Coffee,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-coffee-900/15 bg-cream-100/60 px-6 py-14 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-caramel shadow-card">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-xl text-coffee-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-coffee-500">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
