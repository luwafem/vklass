import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'
import Footer from './Footer'
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Layout() {
  const { authError, triggerRecovery, loading: authLoading } = useAuth()
  const location = useLocation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRecoverBanner, setShowRecoverBanner] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success("You're back online!", { duration: 3000, icon: '🌐' })
    }
    const handleOffline = () => {
      setIsOnline(false)
      toast.error("You're offline. Some features may be limited.", {
        duration: 5000,
        icon: <WifiOff size={16} />,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    if (authError && !showRecoverBanner) {
      setShowRecoverBanner(true)
      const timer = setTimeout(() => setShowRecoverBanner(false), 10000)
      return () => clearTimeout(timer)
    }
    if (!authError) setShowRecoverBanner(false)
  }, [authError, showRecoverBanner])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-[#0c0c0c] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:z-50 focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Navigation loading indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-gray-100 z-[60]">
          <div className="h-full bg-[#0c0c0c] animate-pulse" style={{ width: '30%' }} />
        </div>
      )}

      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200/60 text-amber-800 text-xs py-2 px-5 flex items-center justify-center gap-2">
          <WifiOff size={13} />
          <span>You're offline. Changes may not save until you reconnect.</span>
        </div>
      )}

      {/* Auth error recovery banner */}
      {showRecoverBanner && authError && (
        <div className="bg-red-50 border-b border-red-200/60 text-red-800 py-2.5 px-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span className="text-xs">Session issue detected — {authError}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  setShowRecoverBanner(false)
                  const success = await triggerRecovery()
                  if (!success) {
                    toast.error('Still having issues? Try signing in again.')
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded transition-colors"
              >
                <RefreshCw size={12} />
                Recover session
              </button>
              <button
                onClick={() => setShowRecoverBanner(false)}
                className="text-[11px] text-red-400 hover:text-red-600 px-1.5 py-1 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <main id="main-content" className="flex-1 relative">
        {/* Auth loading overlay for protected routes */}
        {authLoading &&
        (location.pathname.includes('/supplier') ||
          location.pathname.includes('/admin') ||
          location.pathname.includes('/customer')) ? (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-[#0c0c0c] mx-auto mb-3" />
              <p className="text-xs text-gray-500">Verifying access…</p>
            </div>
          </div>
        ) : null}

        <Outlet />
      </main>

      <Footer />

      {/* Dev-only debug */}
      {import.meta.env.DEV && (
        <details className="fixed bottom-2 right-2 text-[10px] bg-[#0c0c0c]/95 text-gray-400 p-2 rounded max-w-xs z-50 border border-white/[0.06]">
          <summary className="cursor-pointer font-mono text-gray-500">Debug</summary>
          <pre className="mt-1 overflow-x-auto">
            {JSON.stringify(
              {
                authLoading,
                hasAuthError: !!authError,
                path: location.pathname,
                online: isOnline,
                navigating: isNavigating,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  )
}