import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabasePublic } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import { ArrowRight } from 'lucide-react'

export default function Landing() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabasePublic
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(4)

      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  const steps = [
    {
      num: '01',
      title: 'Find what you need',
      desc: 'Browse verified listings for social media accounts, phone numbers, bank accounts, or API services. Filter by platform, type, and price.'
    },
    {
      num: '02',
      title: 'Pay securely',
      desc: 'Checkout with Paystack your payment is protected. A ₦500 platform fee applies per order for buyer protection and dispute resolution.'
    },
    {
      num: '03',
      title: 'Get instant delivery',
      desc: 'Credentials delivered immediately after payment. Suppliers receive automatic payouts. No delays, no manual steps.'
    }
  ]

  const categories = [
    { name: 'Social Media', slug: 'social-media' },
    { name: 'Phone Numbers', slug: 'phone-numbers' },
    { name: 'Bank Accounts', slug: 'bank-accounts' },
    { name: 'API Services', slug: 'api-services' },
  ]

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[#0c0c0c] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-16 md:pt-36 md:pb-24">
          <div className="max-w-xl">

            <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.05] tracking-tight">
              Buy & sell<br />digital goods.
            </h1>

            <p className="mt-5 text-gray-400 text-base md:text-lg leading-relaxed max-w-md">
              Social media accounts, phone numbers, bank accounts, and API services. Instant delivery on purchase, automatic payouts on sale.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-[#0c0c0c] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Products <ArrowRight size={15} />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-medium text-sm px-6 py-3 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
            >
              Start Selling
            </Link>
          </div>

          {/* Quick category links */}
          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="text-xs font-medium text-gray-400 border border-gray-800 rounded-full px-3.5 py-1.5 hover:text-white hover:border-gray-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Stats */}
        </div>
      </section>

      {/* ── Latest Products ── */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Latest listings</h2>
              <p className="text-sm text-gray-500 mt-1">Fresh from verified suppliers</p>
            </div>
            <Link
              to="/products"
              className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-1 shrink-0"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3">
            Process
          </p>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-10">How it works</h2>

          <div>
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex gap-5 md:gap-10 py-6 ${i < steps.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <span className="text-sm font-mono text-gray-300 pt-0.5 shrink-0 select-none w-6">
                  {step.num}
                </span>
                <div className="max-w-md">
                  <h3 className="font-semibold text-base md:text-lg leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0c0c0c] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
          <div className="max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              Start selling<br />today.
            </h2>
            <p className="mt-3 text-gray-400 text-sm md:text-base leading-relaxed">
              List your digital products and earn with every sale. Payouts go
              straight to your bank no manual process, no delays.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-[#0c0c0c] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors mt-6"
            >
              Create Supplier Account <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}