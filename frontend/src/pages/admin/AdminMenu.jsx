import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Coffee,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Field from '../../components/ui/Field.jsx'
import Modal from '../../components/ui/Modal.jsx'
import SmartImage from '../../components/ui/SmartImage.jsx'
import { useToast } from '../../hooks/useToast.js'
import {
  createMenuItem,
  deleteMenuItem,
  getMenu,
  updateMenuItem,
} from '../../services/adminService.js'
import { getErrorMessage } from '../../services/api.js'
import { formatCurrency } from '../../utils/format.js'

const CATEGORIES = [
  'Coffee',
  'Tea',
  'Cold Drinks',
  'Breakfast',
  'Mains',
  'Desserts',
  'Snacks',
]

const EMPTY_FORM = {
  itemName: '',
  description: '',
  price: '',
  category: 'Coffee',
  imageUrl: '',
  isAvailable: true,
}

export default function AdminMenu() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [cafeId, setCafeId] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getMenu()
      setItems(result.items)
      setCafeId(result.cafeId)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the menu.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  const categories = useMemo(
    () => ['All', ...new Set(items.map((item) => item.category))],
    [items],
  )

  const filtered = useMemo(
    () => (category === 'All' ? items : items.filter((item) => item.category === category)),
    [items, category],
  )

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      itemName: item.item_name,
      description: item.description || '',
      price: String(item.price),
      category: item.category,
      imageUrl: item.image_url || '',
      isAvailable: item.is_available,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setFormError('')

    const price = Number(form.price)
    if (form.itemName.trim().length < 2) {
      setFormError('Enter an item name.')
      return
    }
    if (form.price === '' || Number.isNaN(price) || price < 0) {
      setFormError('Enter a valid price.')
      return
    }

    const payload = {
      itemName: form.itemName.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
      imageUrl: form.imageUrl.trim() || null,
      isAvailable: form.isAvailable,
    }

    setSaving(true)
    try {
      if (editing) {
        await updateMenuItem(editing.id, payload)
        toast.success('Menu item updated.')
      } else {
        await createMenuItem({ ...payload, cafeId })
        toast.success('Menu item added.')
      }
      setModalOpen(false)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save the menu item.'))
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailable = async (item) => {
    setBusyId(item.id)
    try {
      await updateMenuItem(item.id, { isAvailable: !item.is_available })
      toast.success(
        item.is_available ? 'Item marked unavailable.' : 'Item is back on the menu.',
      )
      setReloadKey((key) => key + 1)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update the item.'))
    } finally {
      setBusyId('')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    try {
      await deleteMenuItem(deleteTarget.id)
      toast.success('Menu item deleted.')
      setDeleteTarget(null)
      setReloadKey((key) => key + 1)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete the item.'))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Menu"
        description="Add dishes, update prices and hide items that have run out. Changes show up on the public menu immediately."
        action={
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> Add item
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2 border-b border-coffee-900/10 pb-4">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              category === item
                ? 'bg-espresso text-cream-50 shadow-soft'
                : 'border border-coffee-900/10 bg-white text-coffee-600 hover:border-coffee-900/30 hover:text-coffee-900'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton h-72" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Coffee}
            title="Could not load the menu"
            description={error}
            action={
              <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Nothing in this category"
            description="Add a new item or switch to another category."
            action={<Button onClick={openAdd}>Add an item</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="surface overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <SmartImage
                    src={item.image_url}
                    alt={item.item_name}
                    className="h-full w-full"
                    imgClassName={item.is_available ? '' : 'grayscale'}
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      item.is_available
                        ? 'bg-emerald-50/95 text-emerald-700'
                        : 'bg-cream-50/95 text-coffee-500'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg text-coffee-900">{item.item_name}</h3>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-coffee-400">
                        {item.category}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-coffee-900">
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-coffee-500">
                    {item.description || 'No description yet.'}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={busyId === item.id}
                      onClick={() => toggleAvailable(item)}
                    >
                      {item.is_available ? 'Mark unavailable' : 'Make available'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => (saving ? null : setModalOpen(false))}
        title={editing ? `Edit ${editing.item_name}` : 'Add a menu item'}
        description="Everything here is visible on the public menu right away."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="menu-form" loading={saving}>
              {editing ? 'Save changes' : 'Add item'}
            </Button>
          </>
        }
      >
        <form id="menu-form" onSubmit={handleSave} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Item name"
              value={form.itemName}
              onChange={(event) =>
                setForm((current) => ({ ...current, itemName: event.target.value }))
              }
              required
            />
            <Field
              label="Category"
              as="select"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Price (INR)"
              type="number"
              min={0}
              step="1"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              required
            />
            <Field
              label="Image URL"
              placeholder="https://images.unsplash.com/…"
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, imageUrl: event.target.value }))
              }
              hint="Optional. A fallback image is used if this is blank."
            />
          </div>

          <Field
            label="Description"
            as="textarea"
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="A short, tempting description…"
          />

          <label className="flex items-center gap-2.5 rounded-2xl border border-coffee-900/10 bg-white px-4 py-3 text-sm text-coffee-700">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) =>
                setForm((current) => ({ ...current, isAvailable: event.target.checked }))
              }
              className="h-4 w-4 rounded border-coffee-300 text-espresso focus:ring-caramel"
            />
            Available to order
          </label>

          {formError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => (busyId ? null : setDeleteTarget(null))}
        title="Delete this menu item?"
        description={deleteTarget?.item_name}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={Boolean(busyId)}
            >
              Keep item
            </Button>
            <Button
              variant="danger"
              loading={Boolean(busyId)}
              onClick={confirmDelete}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-coffee-600">
          This removes the item from the menu entirely. If it is only sold out for
          today, mark it unavailable instead so you can bring it back later.
        </p>
      </Modal>
    </div>
  )
}
