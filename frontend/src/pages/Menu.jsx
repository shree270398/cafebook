import { useEffect, useMemo, useState } from 'react'
import { Coffee, RotateCcw } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import MenuCard from '../components/MenuCard.jsx'
import { PageLoader } from '../components/ui/Spinner.jsx'
import { getCafe, getCafes, getMenu } from '../services/cafeService.js'
import { getErrorMessage } from '../services/api.js'

function MenuSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="overflow-hidden rounded-3xl border border-coffee-900/10 bg-white">
          <div className="skeleton aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Menu() {
  const [cafe, setCafe] = useState(null)
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const cafes = await getCafes()
        if (!cafes.length) throw new Error('No cafe is available right now.')
        const [cafeData, menuItems] = await Promise.all([
          getCafe(cafes[0].id),
          getMenu(cafes[0].id),
        ])
        if (active) {
          setCafe(cafeData)
          setItems(menuItems)
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Could not load the menu.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [reloadKey])

  const categories = useMemo(() => {
    const unique = [...new Set(items.map((item) => item.category))]
    return ['All', ...unique]
  }, [items])

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return items
    return items.filter((item) => item.category === activeCategory)
  }, [items, activeCategory])

  return (
    <div>
      <section className="container-page pt-10 sm:pt-14">
        <div className="max-w-3xl">
          <p className="eyebrow">The menu</p>
          <h1 className="mt-3 text-4xl leading-tight text-coffee-900 sm:text-5xl">
            Brewed, baked and made to order.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-coffee-500 sm:text-base">
            Small-batch coffee, all-day breakfast and desserts that never make
            it to the display case. Prices are in INR and include taxes.
          </p>
        </div>
      </section>

      <section className="container-page py-9">
        {loading ? (
          <MenuSkeleton />
        ) : error ? (
          <EmptyState
            icon={Coffee}
            title="The menu is taking a moment"
            description={error}
            action={
              <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-coffee-900/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeCategory === category
                        ? 'bg-espresso text-cream-50 shadow-soft'
                        : 'border border-coffee-900/10 bg-white text-coffee-600 hover:border-coffee-900/30 hover:text-coffee-900'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <p className="text-xs text-coffee-400">
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                {cafe ? ` · ${cafe.name}` : ''}
              </p>
            </div>

            <div className="mt-8">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Coffee}
                  title="Nothing in this category yet"
                  description="Try another category — the kitchen is always adding something new."
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <section className="container-page pb-8">
        <div className="rounded-3xl border border-coffee-900/10 bg-cream-100 px-6 py-8 text-center sm:px-10">
          <SectionHeading
            align="center"
            eyebrow="Allergies?"
            title="Tell us when you arrive"
            description="Our kitchen handles nuts, dairy and gluten. Let the team know about any allergies and we will guide you through the menu."
          />
        </div>
      </section>
    </div>
  )
}
