import { Link, NavLink } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'

export default function Header() {
  const { settings } = useSettings()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded transition-colors font-body font-medium text-sm ${
      isActive
        ? 'bg-ember-600 text-white'
        : 'text-charcoal-300 hover:text-white hover:bg-charcoal-700'
    }`

  const logoInner = (
    <>
      {settings.logoBase64 ? (
        <img
          src={settings.logoBase64}
          alt="Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
      ) : (
        <div className="w-10 h-10 bg-ember-600 rounded-lg flex items-center justify-center text-white font-display text-lg">
          RC
        </div>
      )}
      <span className="font-display text-xl text-white tracking-widest leading-none">
        RECIPE CARDS
      </span>
    </>
  )

  return (
    <header className="bg-charcoal-900 border-b border-charcoal-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {settings.logoLinkUrl ? (
          <a href={settings.logoLinkUrl} className="flex items-center gap-3">
            {logoInner}
          </a>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            {logoInner}
          </Link>
        )}

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navClass} end>
            Recipes
          </NavLink>
          <NavLink to="/costing" className={navClass}>
            Menu Costing
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `p-2 rounded transition-colors ${
                isActive
                  ? 'text-ember-400 bg-charcoal-700'
                  : 'text-charcoal-500 hover:text-charcoal-300 hover:bg-charcoal-700'
              }`
            }
            title="Admin"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
