import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded transition-colors font-body font-medium text-sm ${
      isActive
        ? 'bg-ember-600 text-white'
        : 'text-charcoal-300 hover:text-white hover:bg-charcoal-700'
    }`

  return (
    <header className="bg-charcoal-900 border-b border-charcoal-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ember-600 rounded-lg flex items-center justify-center text-white font-display text-lg">
            RC
          </div>
          <span className="font-display text-xl text-white tracking-widest leading-none">
            RECIPE CARDS
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navClass} end>
            Recipes
          </NavLink>
          <NavLink to="/costing" className={navClass}>
            Menu Costing
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
