import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../utils/helpers'
import { Users, ShoppingBag, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const { count: users } = await supabase.from('users').select('id', { count: 'exact', head: true })
      const { count: orders } = await supabase.from('orders').select('id', { count: 'exact', head: true })
      const { data: revData } = await supabase.from('orders').select('total_price').eq('status', 'completed')
      setStats({
        users: users || 0,
        orders: orders || 0,
        revenue: revData?.reduce((s, o) => s + Number(o.total_price), 0) || 0
      })
    }
    fetchStats()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Admin</h1>
      <p className="text-sm text-gray-500 mt-1">Platform overview</p>

      <div className="grid grid-cols-3 gap-3 md:gap-5 mt-8">
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <Users size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{stats.users}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Users</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <ShoppingBag size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{stats.orders}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Orders</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 md:p-4">
          <DollarSign size={16} className="text-gray-400 mb-2" strokeWidth={1.5} />
          <div className="text-lg md:text-xl font-bold tabular-nums">{formatPrice(stats.revenue)}</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Revenue</div>
        </div>
      </div>
    </div>
  )
}