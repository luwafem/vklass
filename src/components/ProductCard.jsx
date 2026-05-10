import { Link } from 'react-router-dom'
import { formatPrice, getPlatformLabel, getPlatformLogoUrl, getPlatformInitial } from '../utils/helpers'

export default function ProductCard({ product, itemCount }) {
  const logoUrl = getPlatformLogoUrl(product.platform)
  const platformInitial = getPlatformInitial(product.platform)
  const platformLabel = getPlatformLabel(product.platform)

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="p-4">
        {/* Platform logo + label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-6 h-6 rounded-md  flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${platformLabel} logo`}
                className="w-4 h-4 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling?.classList?.remove('hidden')
                }}
              />
            ) : null}
            {/* Fallback initial */}
            <span className={`hidden absolute text-[10px] font-semibold text-gray-500`}>
              {platformInitial}
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-500">
            {platformLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-gray-600 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price & availability */}
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-base font-bold text-gray-900 tabular-nums">
            {formatPrice(product.base_price)}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            {itemCount !== undefined ? `${itemCount} left` : 'View'}
          </span>
        </div>
      </div>
    </Link>
  )
}