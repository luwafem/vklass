import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabasePublic } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { PLATFORMS, PRODUCT_TYPES } from '../utils/helpers'
import { Search, X } from 'lucide-react'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')

  const platform = searchParams.get('platform') || ''
  const type = searchParams.get('type') || ''

  useEffect(() => {
    fetchProducts()
  }, [platform, type, search])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabasePublic
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('created_at', { ascending: false })

    if (platform) query = query.eq('platform', platform)
    if (type) query = query.eq('type', type)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const handleFilter = (key, val) => {
    const params = new URLSearchParams(searchParams)
    if (val) params.set(key, val)
    else params.delete(key)
    setSearchParams(params)
  }

  const clearAll = () => {
    setSearch('')
    const params = new URLSearchParams()
    setSearchParams(params)
  }

  const hasFilters = platform || type || search

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 md:py-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full border border-gray-200 rounded-lg pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Mobile: Horizontal filter pills ── */}
      <div className="md:hidden -mx-5 px-5 mb-4">
        {/* Platform row */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mb-1 scrollbar-none">
          <Pill active={!platform} onClick={() => handleFilter('platform', '')}>All</Pill>
          {PLATFORMS.map(p => (
            <Pill key={p.value} active={platform === p.value} onClick={() => handleFilter('platform', p.value)}>
              {p.label}
            </Pill>
          ))}
        </div>
        {/* Type row */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <Pill active={!type} onClick={() => handleFilter('type', '')}>All Types</Pill>
          {PRODUCT_TYPES.map(t => (
            <Pill key={t.value} active={type === t.value} onClick={() => handleFilter('type', t.value)}>
              {t.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Active filter clear — mobile */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="md:hidden text-xs text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          Clear all filters
        </button>
      )}

      {/* ── Main content area ── */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-48 shrink-0">
          <div className="space-y-6">
            {/* Platform */}
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-3">
                Platform
              </h3>
              <div className="space-y-0.5">
                <SidebarButton active={!platform} onClick={() => handleFilter('platform', '')}>
                  All Platforms
                </SidebarButton>
                {PLATFORMS.map(p => (
                  <SidebarButton
                    key={p.value}
                    active={platform === p.value}
                    onClick={() => handleFilter('platform', p.value)}
                  >
                    {p.label}
                  </SidebarButton>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-3">
                Type
              </h3>
              <div className="space-y-0.5">
                <SidebarButton active={!type} onClick={() => handleFilter('type', '')}>
                  All Types
                </SidebarButton>
                {PRODUCT_TYPES.map(t => (
                  <SidebarButton
                    key={t.value}
                    active={type === t.value}
                    onClick={() => handleFilter('type', t.value)}
                  >
                    {t.label}
                  </SidebarButton>
                ))}
              </div>
            </div>

            {/* Desktop clear */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 md:p-4 animate-pulse">
                  <div className="h-2.5 bg-gray-100 rounded w-12 mb-3" />
                  <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-4" />
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                    <div className="h-3.5 bg-gray-100 rounded w-14" />
                    <div className="h-2.5 bg-gray-100 rounded w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">No products found.</p>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-sm font-medium text-[#0c0c0c] mt-2 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Mobile pill ── */
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#0c0c0c] text-white border-[#0c0c0c]'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

/* ── Desktop sidebar button ── */
function SidebarButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
        active
          ? 'bg-[#0c0c0c] text-white font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}