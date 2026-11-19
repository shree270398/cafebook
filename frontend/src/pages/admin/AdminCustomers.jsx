import { useCallback, useEffect, useMemo, useState } from 'react'
import { Coffee, RotateCcw, Search, Users } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Field from '../../components/ui/Field.jsx'
import { getCustomers } from '../../services/adminService.js'
import { getErrorMessage } from '../../services/api.js'
import { formatDate, initials } from '../../utils/format.js'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load customers.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((customer) =>
      [customer.full_name, customer.email, customer.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    )
  }, [customers, search])

  const totalActive = customers.reduce(
    (sum, customer) => sum + (customer.active_booking_count || 0),
    0,
  )

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="Everyone who has created a CafeBook account, with their contact details and booking history."
        action={
          <Button variant="secondary" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Field
          icon={Search}
          type="search"
          placeholder="Search by name, email or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:max-w-md"
        />
        <p className="text-xs text-coffee-400">
          {customers.length} {customers.length === 1 ? 'customer' : 'customers'} ·{' '}
          {totalActive} active {totalActive === 1 ? 'booking' : 'bookings'}
        </p>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="skeleton h-20" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Coffee}
            title="Could not load customers"
            description={error}
            action={
              <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'No matching customers' : 'No customers yet'}
            description={
              search
                ? 'Try a different name, email or phone number.'
                : 'New accounts will appear here as soon as people register.'
            }
          />
        ) : (
          <div className="surface overflow-hidden">
            <div className="hidden border-b border-coffee-900/5 bg-cream-100/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-400 sm:grid sm:grid-cols-[1.4fr_1fr_0.7fr_0.6fr] sm:gap-4">
              <span>Customer</span>
              <span>Contact</span>
              <span>Joined</span>
              <span className="text-right">Bookings</span>
            </div>

            <div className="divide-y divide-coffee-900/5">
              {filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_1fr_0.7fr_0.6fr] sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-100 text-xs font-semibold text-coffee-700">
                      {initials(customer.full_name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-coffee-900">
                        {customer.full_name}
                      </p>
                      <p className="truncate text-xs text-coffee-400">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-coffee-600">
                    {customer.phone || <span className="text-coffee-300">No phone</span>}
                  </p>

                  <p className="text-xs text-coffee-400">
                    {formatDate(String(customer.created_at).slice(0, 10))}
                  </p>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-coffee-700">
                      {customer.booking_count}
                    </span>
                    {customer.active_booking_count > 0 && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {customer.active_booking_count} active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
