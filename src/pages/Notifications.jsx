import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/helpers'
import { Bell } from 'lucide-react'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-3.5 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="border border-gray-200 rounded-lg py-12 text-center">
          <Bell size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`w-full text-left px-4 py-3.5 flex gap-3 transition-colors ${
                !n.is_read ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Unread dot */}
              <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${!n.is_read ? 'bg-[#0c0c0c]' : 'bg-transparent'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </p>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                    {formatDate(n.created_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}