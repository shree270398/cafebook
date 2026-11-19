import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  Coffee,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { initials } from '../../utils/format.js'
import Button from '../ui/Button.jsx'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/cafe', label: 'Our Cafe' },
  { to: '/menu', label: 'Menu' },
]

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-coffee-900 after:transition-transform ${
    isActive
      ? 'text-coffee-900 after:scale-x-100'
      : 'text-coffee-500 after:scale-x-0 hover:text-coffee-900 hover:after:scale-x-100'
  }`

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.info('Signed out. See you soon.')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-coffee-900/5 bg-cream-50/85 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso text-cream-50 transition group-hover:bg-caramel">
            <Coffee className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-coffee-900">
            CafeBook<span className="text-caramel">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/bookings" className={navLinkClass}>
              My bookings
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="skeleton h-9 w-32 rounded-full" />
          ) : user ? (
            <>
              <Button as={Link} to="/book" size="sm">
                Reserve a table
              </Button>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-coffee-900/10 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-coffee-800 shadow-sm transition hover:border-coffee-900/25"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coffee-100 text-xs font-semibold text-coffee-700">
                    {initials(user.full_name)}
                  </span>
                  <span className="max-w-[9rem] truncate">{user.full_name.split(' ')[0]}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-coffee-400 transition ${
                      menuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 animate-fade-up rounded-2xl border border-coffee-900/10 bg-white p-2 shadow-soft">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-coffee-900">
                        {user.full_name}
                      </p>
                      <p className="truncate text-xs text-coffee-400">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-coffee-900/5" />
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-coffee-700 transition hover:bg-cream-100"
                    >
                      <User className="h-4 w-4 text-coffee-400" /> Profile
                    </Link>
                    <Link
                      to="/bookings"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-coffee-700 transition hover:bg-cream-100"
                    >
                      <CalendarDays className="h-4 w-4 text-coffee-400" /> My bookings
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-coffee-700 transition hover:bg-cream-100"
                      >
                        <LayoutDashboard className="h-4 w-4 text-coffee-400" /> Admin dashboard
                      </Link>
                    )}
                    <div className="my-1 h-px bg-coffee-900/5" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-coffee-700 transition hover:text-coffee-900"
              >
                Sign in
              </Link>
              <Button as={Link} to="/register" size="sm">
                Reserve a table
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-coffee-900/10 bg-white text-coffee-800 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-coffee-900/5 bg-cream-50 px-5 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-cream-200/70 text-coffee-900' : 'text-coffee-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <>
                <NavLink
                  to="/bookings"
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive ? 'bg-cream-200/70 text-coffee-900' : 'text-coffee-600'
                    }`
                  }
                >
                  My bookings
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive ? 'bg-cream-200/70 text-coffee-900' : 'text-coffee-600'
                    }`
                  }
                >
                  Profile
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-3 text-sm font-medium ${
                        isActive ? 'bg-cream-200/70 text-coffee-900' : 'text-coffee-600'
                      }`
                    }
                  >
                    Admin dashboard
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-coffee-900/5 pt-4">
            {loading ? (
              <div className="skeleton h-10 w-full rounded-full" />
            ) : user ? (
              <>
                <Button as={Link} to="/book" size="md">
                  Reserve a table
                </Button>
                <Button variant="outline" size="md" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/register" size="md">
                  Create an account
                </Button>
                <Button as={Link} to="/login" variant="outline" size="md">
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
