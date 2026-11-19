import { Link } from 'react-router-dom'
import { Coffee, Home } from 'lucide-react'
import Button from '../components/ui/Button.jsx'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-caramel">
        <Coffee className="h-7 w-7" />
      </span>
      <p className="mt-6 font-display text-6xl text-coffee-900">404</p>
      <h1 className="mt-2 text-2xl text-coffee-900">This table does not exist.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-coffee-500">
        The page you are looking for has moved, or maybe it was never on the menu.
        Let us get you back to the good stuff.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/">
          <Home className="h-4 w-4" /> Back home
        </Button>
        <Button as={Link} to="/menu" variant="outline">
          Browse the menu
        </Button>
      </div>
    </div>
  )
}
