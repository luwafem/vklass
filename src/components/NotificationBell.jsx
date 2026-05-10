import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      setUnread(count || 0)
    }
    fetchUnread()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        setUnread(prev => prev + 1)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchUnread()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative text-gray-400 hover:text-white transition-colors p-1 -mr-1"
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
    >
      <Bell size={20} strokeWidth={1.5} />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}