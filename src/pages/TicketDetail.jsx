import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../utils/helpers'
import { ArrowLeft } from 'lucide-react'

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTicket() }, [id])

  const fetchTicket = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    setTicket(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="border border-gray-200 rounded-lg p-6 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="text-sm text-gray-500">Ticket not found.</p>
        <Link
          to="/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0c0c0c] mt-3 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Support
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <Link
        to="/support"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Support
      </Link>

      <div className="border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">{ticket.subject}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Created {formatDate(ticket.created_at)}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
            ticket.status === 'open'
              ? 'bg-[#0c0c0c] text-white'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {ticket.status}
          </span>
        </div>

        {/* Message */}
        <div className="border-t border-gray-200 px-5 py-5">
          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {ticket.message}
          </div>
        </div>
      </div>
    </div>
  )
}