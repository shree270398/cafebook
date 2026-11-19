import { ArrowUpRight } from 'lucide-react'

const TONES = {
  default: 'bg-cream-100 text-coffee-700',
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  coffee: 'bg-espresso text-cream-50',
}

export default function StatCard({ label, value, icon: Icon, tone = 'default', hint }) {
  return (
    <div className="surface flex items-start gap-4 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          TONES[tone] || TONES.default
        }`}
      >
        {Icon ? <Icon className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coffee-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-coffee-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-coffee-400">{hint}</p>}
      </div>
    </div>
  )
}
