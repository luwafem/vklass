import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/helpers'
import { Users } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('users').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  const toggleActive = async (id, isActive) => {
    await supabase.from('users').update({ is_active: !isActive }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !isActive } : u))
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">User Management</h1>
      <p className="text-sm text-gray-500 mt-1">{users.length} user{users.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="mt-6 border border-gray-200 rounded-lg p-4 animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-lg py-12 text-center">
          <Users size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No users yet.</p>
        </div>
      ) : (
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Name</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Role</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Joined</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Status</th>
                  <th className="text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{u.full_name || '—'}</div>
                      <div className="text-[11px] text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.is_active ? 'bg-[#0c0c0c] text-white' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleActive(u.id, u.is_active)}
                        className={`text-xs font-medium transition-colors ${
                          u.is_active
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-gray-900 hover:text-gray-600'
                        }`}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}