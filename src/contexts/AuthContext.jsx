import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const profileRef = useRef(null)
  const voluntarySignOutRef = useRef(false)

  const fetchProfile = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return profileRef.current
      profileRef.current = data
      return data
    } catch {
      return profileRef.current
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        // 1. Handle User State
        if (session?.user) {
          setUser(session.user)
          // Fetch profile in background so it doesn't block the loading state
          fetchProfile(session.user.id).then(p => {
            if (mounted && p) setProfile(p)
          })
        } else {
          setUser(null)
          setProfile(null)
          profileRef.current = null
        }

        // 2. Handle Loading State (CRITICAL FIX)
        // Turn off loading for ANY event that tells us the user's auth status
        if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_DELETED'].includes(event)) {
          setLoading(false)
        }

        // 3. Handle Toasts
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          if (!voluntarySignOutRef.current) {
            toast.error('Session expired. Please sign in again.', {
              id: 'session-expired',
              duration: 5000
            })
          }
          voluntarySignOutRef.current = false
          setAuthError(null)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setAuthError(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) setAuthError(null)
    return { data, error }
  }

  const signOut = useCallback(async () => {
    voluntarySignOutRef.current = true
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.warn('Supabase signOut error (ignoring):', error?.message)
    }
    setUser(null)
    setProfile(null)
    profileRef.current = null
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id)
      if (p) setProfile(p)
    }
  }, [user, fetchProfile])

  const triggerRecovery = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (data.session) {
        toast.success('Session recovered!')
        return true
      }
      toast.error('Could not recover. Please sign in again.')
      return false
    } catch {
      toast.error('Could not recover. Please sign in again.')
      return false
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user, profile, loading, authError, triggerRecovery, signUp, signIn, signOut, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}