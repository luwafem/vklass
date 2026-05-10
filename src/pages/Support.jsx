import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { MessageSquare, Plus, X } from 'lucide-react'

export default function Support() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTickets() }, [user])

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: form.subject,
      message: form.message,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Ticket created')
      setForm({ subject: '', message: '' })
      setShowForm(false)
      fetchTickets()
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Support</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0c0c0c] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
        >
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">New Ticket</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              required
              placeholder="Subject"
              value={form.subject}
              onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
            <textarea
              required
              placeholder="Describe your issue…"
              rows={4}
              value={form.message}
              onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#0c0c0c] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="border border-gray-200 rounded-lg py-12 text-center">
          <MessageSquare size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No support tickets yet.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {tickets.map(t => (
            <Link
              key={t.id}
              to={`/support/${t.id}`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0 mr-3">
                <div className="text-sm font-medium text-gray-900 truncate">{t.subject}</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(t.created_at)}</div>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                t.status === 'open'
                  ? 'bg-[#0c0c0c] text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {t.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}