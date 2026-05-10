import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getPlatformLabel, formatPrice } from '../../utils/helpers'
import { Plus, Package } from 'lucide-react'

export default function SupplierProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProducts() }, [user])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const toggleActive = async (id, isActive) => {
    await supabase.from('products').update({ is_active: !isActive }).eq('id', id)
    fetchProducts()
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">My Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/supplier/products/new"
          className="bg-[#0c0c0c] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5">
          <Plus size={15} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex justify-between">
                <div><div className="h-4 bg-gray-100 rounded w-48 mb-2" /><div className="h-3 bg-gray-100 rounded w-24" /></div>
                <div className="flex gap-2"><div className="h-6 bg-gray-100 rounded w-14" /><div className="h-6 bg-gray-100 rounded w-16" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="border border-gray-200 rounded-lg py-12 text-center">
          <Package size={28} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No products yet.</p>
          <Link to="/supplier/products/new"
            className="inline-block bg-[#0c0c0c] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors mt-4">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="min-w-0 mr-3">
                <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{getPlatformLabel(p.platform)} · {formatPrice(p.base_price)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(p.id, p.is_active)}
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                    p.is_active ? 'bg-[#0c0c0c] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </button>
                <Link to={`/supplier/products/${p.id}/items`}
                  className="text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors px-2 py-1">
                  Inventory
                </Link>
                <Link to={`/supplier/products/${p.id}/edit`}
                  className="text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors px-2 py-1">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}