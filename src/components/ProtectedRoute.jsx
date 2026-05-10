import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()

  // 1. Auth is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 3. Logged in, but profile is still fetching. 
  // WAIT HERE. Do not redirect yet, otherwise you get kicked out.
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    )
  }

  // 4. Role check (admin bypasses all)
  if (role && profile.role !== role && profile.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}