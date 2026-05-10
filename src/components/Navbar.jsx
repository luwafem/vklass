import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from './NotificationBell'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Bell, Package } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenuOpen])

  // Close mobile menu on escape
  useEffect(() => {
    if (!mobileOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setUserMenuOpen(false)
    setMobileOpen(false)
  }

  const dashboardPath = profile?.role === 'admin'
    ? '/admin/dashboard'
    : profile?.role === 'supplier'
    ? '/supplier/dashboard'
    : '/customer/dashboard'

  const navLinks = [
    { to: '/products', label: 'Products' },
    ...(user ? [{ to: '/support', label: 'Support' }] : []),
    ...(profile?.role === 'supplier' ? [{ to: '/supplier/products', label: 'My Products' }] : []),
  ]

  return (
    <nav className="bg-[#0c0c0c] text-white sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="text-lg font-bold tracking-tight shrink-0">
            vklass
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[13px] text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 text-sm hover:text-gray-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-[11px] font-semibold">
                      {(profile?.full_name || user.email)[0].toUpperCase()}
                    </div>
                    <ChevronDown
                      size={12}
                      className={`text-gray-500 transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-lg border border-gray-200 py-1 shadow-sm">
                      {/* User info header */}
                      <div className="px-3 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-medium truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={dashboardPath}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                        >
                          <Bell size={14} className="text-gray-400" />
                          Notifications
                        </Link>
                        {profile?.role === 'customer' && (
                          <Link
                            to="/customer/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                          >
                            <Package size={14} className="text-gray-400" />
                            My Orders
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600 transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-[#0c0c0c] text-[13px] font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1 -mr-1 text-gray-400 hover:text-white transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06]">
          <div className="px-5 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user ? (
            <>
              {/* User info */}
              <div className="px-5 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-xs font-semibold">
                    {(profile?.full_name || user.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* User actions */}
              <div className="px-5 py-2 border-t border-white/[0.06] space-y-1">
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Bell size={15} /> Notifications
                </Link>
                {profile?.role === 'customer' && (
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Package size={15} /> My Orders
                  </Link>
                )}
              </div>

              <div className="px-5 py-2 border-t border-white/[0.06]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 py-2 text-sm text-red-500 hover:text-red-400 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="px-5 py-3 border-t border-white/[0.06] flex gap-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gray-400 hover:text-white transition-colors py-2"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="bg-white text-[#0c0c0c] text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}