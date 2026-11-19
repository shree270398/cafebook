import { CheckCircle2, XCircle } from 'lucide-react'
import SmartImage from './ui/SmartImage.jsx'
import { formatCurrency } from '../utils/format.js'

export default function MenuCard({ item }) {
  const available = item.is_available

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-coffee-900/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={item.image_url}
          alt={item.item_name}
          className="h-full w-full"
          imgClassName={`transition duration-700 group-hover:scale-105 ${
            available ? '' : 'grayscale'
          }`}
        />
        <span className="absolute left-4 top-4 rounded-full bg-cream-50/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-coffee-600 backdrop-blur">
          {item.category}
        </span>
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-espresso/55">
            <span className="rounded-full bg-cream-50 px-4 py-1.5 text-xs font-semibold text-coffee-900">
              Currently unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl leading-snug text-coffee-900">{item.item_name}</h3>
          <span className="shrink-0 rounded-full bg-cream-100 px-3 py-1 text-sm font-semibold text-coffee-900">
            {formatCurrency(item.price)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-coffee-500">
          {item.description || 'A CafeBook favourite, made fresh to order.'}
        </p>

        <div
          className={`mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium ${
            available ? 'text-emerald-700' : 'text-coffee-400'
          }`}
        >
          {available ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Available today
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" /> Back on the menu soon
            </>
          )}
        </div>
      </div>
    </article>
  )
}
