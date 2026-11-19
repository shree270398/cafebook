import { useCallback, useEffect, useState } from 'react'
import {
  Armchair,
  Coffee,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Users,
} from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Field from '../../components/ui/Field.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useToast } from '../../hooks/useToast.js'
import {
  createTable,
  getTables,
  updateTable,
} from '../../services/adminService.js'
import { getErrorMessage } from '../../services/api.js'

export default function AdminTables() {
  const toast = useToast()
  const [tables, setTables] = useState([])
  const [cafeId, setCafeId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ tableNumber: '', capacity: 2, isActive: true })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [busyId, setBusyId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getTables()
      setTables(result.tables)
      setCafeId(result.cafeId)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the tables.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  const openAdd = () => {
    const nextNumber =
      tables.reduce((max, table) => Math.max(max, table.table_number), 0) + 1
    setEditing(null)
    setForm({ tableNumber: nextNumber, capacity: 2, isActive: true })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (table) => {
    setEditing(table)
    setForm({
      tableNumber: table.table_number,
      capacity: table.capacity,
      isActive: table.is_active,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setFormError('')

    const tableNumber = Number(form.tableNumber)
    const capacity = Number(form.capacity)

    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
      setFormError('Enter a valid table number.')
      return
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) {
      setFormError('Seats must be between 1 and 20.')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await updateTable(editing.id, {
          tableNumber,
          capacity,
          isActive: form.isActive,
        })
        toast.success('Table updated.')
      } else {
        await createTable({ cafeId, tableNumber, capacity, isActive: form.isActive })
        toast.success('Table added to the floor plan.')
      }
      setModalOpen(false)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save the table.'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (table) => {
    setBusyId(table.id)
    try {
      await updateTable(table.id, { isActive: !table.is_active })
      toast.success(
        table.is_active
          ? 'Table deactivated. It is hidden from new reservations.'
          : 'Table activated and open for bookings.',
      )
      setReloadKey((key) => key + 1)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update the table.'))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Tables"
        description="Manage the floor plan. Guests only see active tables when they reserve, and every table has a real seat count."
        action={
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> Add table
          </Button>
        }
      />

      <div className="mt-5 rounded-2xl border border-coffee-900/10 bg-cream-100/70 px-4 py-3 text-xs leading-relaxed text-coffee-500">
        Deactivating a table hides it from new reservations. Existing bookings for
        that table stay intact.
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton h-44" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Coffee}
            title="Could not load the floor plan"
            description={error}
            action={
              <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            }
          />
        ) : tables.length === 0 ? (
          <EmptyState
            icon={Armchair}
            title="No tables yet"
            description="Add your first table to start accepting reservations."
            action={<Button onClick={openAdd}>Add a table</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`surface p-5 ${
                  table.is_active ? '' : 'bg-cream-100/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coffee-400">
                      Table
                    </p>
                    <p className="font-display text-4xl leading-none text-coffee-900">
                      {table.table_number}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      table.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-coffee-900/10 bg-cream-200 text-coffee-500'
                    }`}
                  >
                    {table.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-coffee-600">
                  <Users className="h-4 w-4 text-caramel" /> Seats {table.capacity}
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(table)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busyId === table.id}
                    onClick={() => toggleActive(table)}
                    className={table.is_active ? 'text-red-600 hover:bg-red-50' : ''}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {table.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => (saving ? null : setModalOpen(false))}
        title={editing ? `Edit table ${editing.table_number}` : 'Add a table'}
        description="Give the table a number and the maximum number of guests it can seat."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="table-form" loading={saving}>
              {editing ? 'Save changes' : 'Add table'}
            </Button>
          </>
        }
      >
        <form id="table-form" onSubmit={handleSave} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Table number"
              type="number"
              min={1}
              max={999}
              value={form.tableNumber}
              onChange={(event) =>
                setForm((current) => ({ ...current, tableNumber: event.target.value }))
              }
              required
            />
            <Field
              label="Seats"
              type="number"
              min={1}
              max={20}
              value={form.capacity}
              onChange={(event) =>
                setForm((current) => ({ ...current, capacity: event.target.value }))
              }
              required
            />
          </div>

          <label className="flex items-center gap-2.5 rounded-2xl border border-coffee-900/10 bg-white px-4 py-3 text-sm text-coffee-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
              className="h-4 w-4 rounded border-coffee-300 text-espresso focus:ring-caramel"
            />
            Table is active and can be reserved
          </label>

          {formError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
