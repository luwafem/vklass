// pages/SupplierStorefront.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabasePublic } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { ArrowLeft, Package, Store, Share2, Copy, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupplierStorefront() {
  const { supplierId, storeSlug } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    fetchStore()
  }, [supplierId, storeSlug])

  const fetchStore = async () => {
    setLoading(true)
    setIsPreview(false)
    
    try {
      // Fetch supplier with correct columns for YOUR schema
      let query = supabasePublic
        .from('users')
        .select('id, full_name, store_name, store_bio, store_slug, public_email, avatar_storage_path')
      
      if (storeSlug) {
        query = query.eq('store_slug', storeSlug).eq('store_enabled', true).limit(1)
      } else if (supplierId) {
        query = query.eq('id', supplierId).eq('store_enabled', true).limit(1)
      }
      
      const {  data, error } = await query.single()
      
      // Handle not found / RLS blocked
      if (!data || error) {
        // Fallback: owner preview (fetch by ID without store_enabled filter)
        if (supplierId && !storeSlug) {
          const {  fallback } = await supabasePublic
            .from('users')
            .select('id, full_name, store_name, store_bio, store_slug, public_email, avatar_storage_path')
            .eq('id', supplierId)
            .single()
          
          if (fallback) {
            setSupplier(fallback)
            await loadProducts(fallback.id)
            setIsPreview(true)
            toast('Preview mode: enable store to share publicly', { icon: '⚠️', duration: 4000 })
            setLoading(false)
            return
          }
        }
        throw new Error('Store not found or not enabled')
      }
      
      setSupplier(data)
      await loadProducts(data.id)
      
    } catch (err) {
      console.error('Storefront error:', err)
      toast.error('Store not found')
      setTimeout(() => navigate('/products'), 1500)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async (supplierId) => {
    const {  data } = await supabasePublic
      .from('products')
      .select('*')
      .eq('supplier_id', supplierId)
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
    setProducts(data || [])
  }

  const storeUrl = storeSlug 
    ? `${window.location.origin}/store/slug/${storeSlug}`
    : `${window.location.origin}/store/${supplierId}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-64 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
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
        </div>
      </div>
    )
  }

  // Preview mode warning (owner viewing disabled store)
  if (isPreview && supplier) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Store size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Preview Mode</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your store is not publicly enabled yet. Enable it in your dashboard to share with customers.
            </p>
            <Link to="/supplier/dashboard" className="inline-block text-xs font-medium text-amber-900 hover:underline mt-1">
              Go to Dashboard →
            </Link>
          </div>
        </div>
        <StoreContent 
          supplier={supplier} 
          products={products} 
          storeUrl={storeUrl}
          copied={copied}
          onCopyLink={copyLink}
        />
      </div>
    )
  }

  // Not found
  if (!supplier) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">
        <Store size={40} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-gray-800">Store not found</h2>
        <p className="text-sm text-gray-500 mt-1">
          {storeSlug 
            ? `No store found with URL "/store/slug/${storeSlug}"` 
            : 'This store may be disabled or doesn\'t exist.'}
        </p>
        <Link to="/products" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#0c0c0c] hover:underline">
          <ArrowLeft size={14} /> Browse Marketplace
        </Link>
      </div>
    )
  }

  return (
    <StoreContent 
      supplier={supplier} 
      products={products} 
      storeUrl={storeUrl}
      copied={copied}
      onCopyLink={copyLink}
    />
  )
}

// 🎨 Reusable store content component (preview + normal mode)
function StoreContent({ supplier, products, storeUrl, copied, onCopyLink }) {
  const displayName = supplier.store_name 
    || supplier.full_name 
    || (supplier.public_email?.split('@')[0]) 
    || 'Supplier Store'
    
  const bio = supplier.store_bio
  
  // Convert avatar_storage_path to public URL (Supabase Storage)
  const avatarUrl = supplier.avatar_storage_path 
    ? `https://wwcnxqaecxounondelxv.supabase.co/storage/v1/object/public/avatars/${supplier.avatar_storage_path}`
    : null

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Marketplace
      </Link>

      {/* Store Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar with fallback */}
            <div className="relative w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {avatarUrl && (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling?.classList?.remove('hidden')
                  }}
                />
              )}
              <span className={`absolute text-lg font-semibold text-gray-400 ${avatarUrl ? 'hidden' : ''}`}>
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{displayName}</h1>
              {bio && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{bio}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span>{products.length} product{products.length !== 1 ? 's' : ''}</span>
                {supplier.store_slug && (
                  <span className="flex items-center gap-1">
                  </span>
                )}
                {supplier.public_email && (
                  <span className="flex items-center gap-1 text-gray-300">
                    <User size={10} /> {supplier.public_email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={onCopyLink}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 transition-colors self-start sm:self-auto"
            title="Copy store link"
          >
            {copied ? <Copy size={14} className="text-green-500" /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share Store'}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-xl bg-white">
          <Package size={32} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">No products listed yet.</p>
          <p className="text-xs text-gray-400 mt-1">Check back soon for new items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Want to sell on vklass?{' '}
          <Link to="/supplier/dashboard" className="font-medium text-[#0c0c0c] hover:underline">
            Become a supplier
          </Link>
        </p>
      </div>
    </div>
  )
}