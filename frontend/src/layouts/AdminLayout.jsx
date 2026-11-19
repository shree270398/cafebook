import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Armchair,
  CalendarDays,
  Coffee,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { initials } from '../utils/format.js'

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/admin/tables', label: 'Tables', icon: Armchair },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/customers', label: 'Customers', icon: Users },
]

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 text-espresso">
          <Coffee className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-xl font-semibold text-cream-50">CafeBook</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cream-200/50">
            Admin console
          </p>
        </div>
      </div>

      <nav className="mt-9 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `admin-link ${isActive ? 'admin-link-active' : ''}`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-cream-200/60 transition hover:text-cream-50"
        >
          <Coffee className="h-3.5 w-3.5" /> Back to the cafe
        </Link>

        <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-100 text-xs font-semibold text-coffee-800">
            {initials(user?.full_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-cream-50">
              {user?.full_name}
            </p>
            <p className="truncate text-[10px] text-cream-200/50">Administrator</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto rounded-lg p-1.5 text-cream-200/60 transition hover:bg-white/10 hover:text-cream-50"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-cream-50 lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 bg-espresso p-6 lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[85%] max-w-xs animate-fade-in bg-espresso p-6">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-cream-50"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-coffee-900/10 bg-cream-50/90 px-5 py-3 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-coffee-900/10 bg-white"
              aria-label="Open navigation"
            >
              <MenuIcon className="h-4 w-4" />
            </button>
            <span className="font-display text-lg font-semibold">Admin</span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-xs font-semibold text-cream-50">
            {initials(user?.full_name)}
          </span>
        </header>

        <div className="p-5 sm:p-8 lg:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
