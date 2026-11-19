const STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-red-200 bg-red-50 text-red-600',
  completed: 'border-coffee-200 bg-coffee-50 text-coffee-600',
}

export default function StatusBadge({ status, className = '' }) {
  const style = STYLES[status] || STYLES.completed

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${style} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
