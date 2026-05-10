import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#0c0c0c] text-gray-500 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="text-white text-lg font-bold tracking-tight">
              vklass
            </Link>
            <p className="text-sm mt-2 leading-relaxed">
              Buy and sell social media accounts, phone numbers, bank accounts, and API services. Instant delivery, automatic payouts.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 md:gap-16">
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-3">
                Marketplace
              </h4>
              <div className="space-y-2 text-sm">
                <Link to="/products" className="block hover:text-white transition-colors">
                  Browse Products
                </Link>
                <Link to="/signup" className="block hover:text-white transition-colors">
                  Become a Supplier
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-3">
                Support
              </h4>
              <div className="space-y-2 text-sm">
                <Link to="/support" className="block hover:text-white transition-colors">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} vklass. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Secure payments via Paystack
          </p>
        </div>
      </div>
    </footer>
  )
}