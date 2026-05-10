import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, X } from 'lucide-react'

export default function Inventory() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ attributes: '{}', credentials: '{}', price_override: '' })

  useEffect(() => { fetchItems() }, [id])

  const fetchItems = async () => {
    const { data } = await supabase.from('product_items').select('*').eq('product_id', id).order('created_at', { ascending: false })
    setItems(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const attrs = JSON.parse(form.attributes)
      const creds = JSON.parse(form.credentials)
      const { error } = await supabase.from('product_items').insert({
        product_id: id,
        attributes: attrs,
        credentials: creds,
        price_override: form.price_override ? Number(form.price_override) : null,
      })
      if (error) throw error
      toast.success('Item added')
      setShowForm(false)
      setForm({ attributes: '{}', credentials: '{}', price_override: '' })
      fetchItems()
    } catch (err) {
      toast.error(err.message || 'Invalid JSON format')
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Delete this item?')) return
    await supabase.from('product_items').delete().eq('id', itemId)
    fetchItems()
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors'

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#0c0c0c] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5">
          <Plus size={15} /> Add Item
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">New Item</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Attributes (JSON)</label>
              <textarea rows={3} value={form.attributes} onChange={e => setForm(p => ({ ...p, attributes: e.target.value }))}
                className={inputClass + ' font-mono text-xs resize-none'}
                placeholder='{"age": "2 years", "location": "US"}' />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Credentials (JSON) — Hidden until purchase</label>
              <textarea rows={3} value={form.credentials} onChange={e => setForm(p => ({ ...p, credentials: e.target.value }))}
                className={inputClass + ' font-mono text-xs resize-none'}
                placeholder='{"username": "johndoe", "password": "pass123"}' />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Price Override (₦) — Leave blank to use base price</label>
              <input type="number" value={form.price_override} onChange={e => setForm(p => ({ ...p, price_override: e.target.value }))}
                className={inputClass} />
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="bg-[#0c0c0c] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Save Item
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="border border-gray-200 rounded-lg py-12 text-center">
          <p className="text-sm text-gray-500">No inventory items yet.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {items.map(item => (
            <div key={item.id} className={`flex items-start justify-between px-4 py-3.5 ${item.is_sold ? 'opacity-50' : ''}`}>
              <div className="min-w-0 mr-3">
                <pre className="text-[11px] font-mono text-gray-600 bg-gray-50 border border-gray-200 rounded p-2.5 overflow-x-auto">
                  {JSON.stringify(item.attributes, null, 2)}
                </pre>
                {item.price_override && (
                  <p className="text-xs font-medium mt-1.5 tabular-nums">₦{item.price_override}</p>
                )}
                <span className={`text-[10px] font-semibold uppercase tracking-wider mt-1.5 inline-block px-1.5 py-0.5 rounded ${
                  item.is_sold ? 'bg-gray-100 text-gray-500' : 'bg-[#0c0c0c] text-white'
                }`}>
                  {item.is_sold ? 'Sold' : 'Available'}
                </span>
              </div>
              {!item.is_sold && (
                <button onClick={() => handleDelete(item.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors shrink-0 mt-1">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}