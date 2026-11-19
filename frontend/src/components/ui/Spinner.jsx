import { Loader2 } from 'lucide-react'

export default function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-caramel ${className}`} />
}

export function PageLoader({ label = 'Brewing something good…' }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100">
        <Spinner className="h-6 w-6" />
      </div>
      <p className="text-sm text-coffee-500">{label}</p>
    </div>
  )
}
