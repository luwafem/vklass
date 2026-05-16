import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabasePublic } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatPrice, getPlatformLabel, getTypeLabel, getPlatformLogoUrl, getPlatformInitial } from '../utils/helpers'
import toast from 'react-hot-toast'
import { ShoppingCart, Package, AlertCircle, ArrowLeft } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [schemaWarning, setSchemaWarning] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabasePublic
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('column')) {
            setSchemaWarning(true)
            console.warn('Schema mismatch detected.')
          }
          throw error
        }

        if (data) {
          data.attributes = data.attributes || {}
          data.credentials = data.credentials || {}
        }

        setProduct(data)
      } catch (err) {
        console.error('Error fetching product:', err)
        if (!schemaWarning) {
          toast.error('Failed to load product details')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleBuy = () => {
    if (!user) {
      toast.error('Please sign in to purchase')
      navigate('/login')
      return
    }
    if (!product) return

    navigate('/checkout', {
      state: {
        productId: product.id,
        itemName: product.name,
        itemPrice: product.base_price,
      },
    })
  }

  // Clean attribute renderer
  const renderAttributes = () => {
    const attrs = product?.attributes && typeof product.attributes === 'object' ? product.attributes : {}
    const entries = Object.entries(attrs).filter(([_, v]) => v && typeof v !== 'object')

    if (entries.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {entries.map(([key, value]) => (
          <span
            key={key}
            className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded"
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
          </span>
        ))}
      </div>
    )
  }

  // 🎯 Platform logo component (inline for simplicity)
  const PlatformLogo = ({ platform, size = 'md' }) => {
    const logoUrl = getPlatformLogoUrl(platform)
    const initial = getPlatformInitial(platform)
    const label = getPlatformLabel(platform)
    
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    }
    
    const imgSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-8 h-8',
    }

    return (
      <div className={`relative ${sizeClasses[size]} rounded-lg  flex items-center justify-center overflow-hidden flex-shrink-0`} title={label}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${label} logo`}
            className={`${imgSizeClasses[size]} object-contain`}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling?.classList?.remove('hidden')
            }}
          />
        )}
        <span className="hidden absolute text-xs font-semibold text-gray-500">
          {initial}
        </span>
      </div>
    )
  }

  // Schema warning view
  if (schemaWarning) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="font-semibold text-amber-800 text-sm">Limited Product View</h3>
            <p className="text-xs text-amber-700 mt-1">
              Some details may not display correctly. Please contact support or refresh the page.
            </p>
          </div>
        </div>

        {product && (
          <div className="mt-8">
            {/* Platform logo + label */}
            <div className="flex items-center gap-2 mb-4">
              <PlatformLogo platform={product.platform} size="sm" />
              <span className="text-sm font-medium text-gray-600">
                {getPlatformLabel(product.platform)}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-500 mt-2 text-sm">{product.description}</p>
            <div className="mt-4 text-2xl font-bold">{formatPrice(product.base_price)}</div>
            <button
              onClick={handleBuy}
              disabled={product.is_sold}
              className="mt-6 bg-[#0c0c0c] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
            >
              {product.is_sold ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-lg" />
          <div className="space-y-4">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-6 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-8 bg-gray-100 rounded w-24 mt-6" />
            <div className="h-12 bg-gray-100 rounded w-full mt-8" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">
        <Package size={40} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-gray-800">Product not found</h2>
        <p className="text-sm text-gray-500 mt-1">This item may have been removed or sold.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-6 text-sm font-medium text-[#0c0c0c] hover:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Browse Marketplace
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      {/* Back link */}
      <button
        onClick={() => navigate('/products')}
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft size={14} /> Products
      </button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image placeholder with platform logo overlay */}
        <div className="relative w-full aspect-square bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
          <Package size={56} className="text-gray-300" strokeWidth={1} />
          
          {/* Platform logo badge in corner */}
          <div className="absolute top-4 left-4">
            <PlatformLogo platform={product.platform} size="md" />
          </div>
        </div>

        {/* Details */}
        <div>
          {/* Platform + Type chips with logo */}
          <div className="flex items-center gap-3 mb-4">
            <PlatformLogo platform={product.platform} size="sm" />
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {getPlatformLabel(product.platform)}
              </span>
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {getTypeLabel(product.type)}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">
            {product.name}
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-3 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>

          {/* Dynamic attributes */}
          {renderAttributes()}

          {/* Price */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-[#0c0c0c] tabular-nums">
                {formatPrice(product.base_price)}
              </span>
              <span className="text-xs text-gray-400">+ ₦500 fee</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Instant delivery · Secure checkout
            </p>
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={product.is_sold}
            className={`w-full mt-6 py-3.5 px-6 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              product.is_sold
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#0c0c0c] text-white hover:bg-gray-800 active:bg-gray-900'
            }`}
          >
            
            {product.is_sold ? 'Sold Out' : 'Buy Now'}
          </button>

          {!product.is_sold && (
            <p className="text-[11px] text-center text-gray-400 mt-3">
              Credentials revealed immediately after payment.
            </p>
          )}
        </div>
      </div>

      {/* What you get */}
      
    </div>
  )
}