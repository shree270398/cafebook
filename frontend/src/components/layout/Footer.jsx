import { Link } from 'react-router-dom'
import {
  Clock,
  Coffee,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react'

const socials = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-coffee-900/10 bg-cream-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1 lg:pr-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso text-cream-50">
              <Coffee className="h-4 w-4" />
            </span>
            <span className="font-display text-2xl font-semibold text-coffee-900">
              CafeBook<span className="text-caramel">.</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-coffee-500">
            A neighbourhood cafe for slow mornings, warm brews and the kind of
            afternoons that stretch a little longer than planned.
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-coffee-900/10 bg-white text-coffee-600 transition hover:border-coffee-900/30 hover:text-coffee-900"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-400">
            Explore
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-coffee-600">
            <li>
              <Link className="transition hover:text-coffee-900" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-coffee-900" to="/cafe">
                Our cafe
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-coffee-900" to="/menu">
                Menu
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-coffee-900" to="/book">
                Reserve a table
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-400">
            Your account
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-coffee-600">
            <li>
              <Link className="transition hover:text-coffee-900" to="/bookings">
                My bookings
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-coffee-900" to="/profile">
                Profile
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-coffee-900" to="/login">
                Sign in
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-coffee-900" to="/register">
                Create an account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-400">
            Visit us
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-coffee-600">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
              <span>24, 5th Cross, Indiranagar, Bengaluru 560038</span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
              <span>Every day, 10:00 AM – 10:00 PM</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
              <a className="transition hover:text-coffee-900" href="tel:+919876543210">
                +91 98765 43210
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-caramel" />
              <a className="transition hover:text-coffee-900" href="mailto:hello@cafebook.in">
                hello@cafebook.in
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-coffee-900/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-coffee-400 sm:flex-row">
          <p>© {new Date().getFullYear()} CafeBook. All rights reserved.</p>
          <p>Crafted slowly, like a good cup of coffee.</p>
        </div>
      </div>
    </footer>
  )
}
