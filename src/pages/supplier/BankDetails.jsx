import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'

export default function BankDetails() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ bank_name: '', bank_code: '', account_number: '', account_name: '' })
  const [loading, setLoading] = useState(false)
  const [banks, setBanks] = useState([])
  const [fetchingBanks, setFetchingBanks] = useState(true)

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('https://api.paystack.co/bank?country=nigeria')
        const data = await response.json()
        if (data.status) {
          setBanks(data.data.sort((a, b) => a.name.localeCompare(b.name)))
        } else {
          toast.error('Could not load bank list.')
        }
      } catch (err) {
        toast.error('Network error loading banks.')
      } finally {
        setFetchingBanks(false)
      }
    }
    fetchBanks()
  }, [])

  useEffect(() => {
    if (profile?.bank_details) {
      setForm({
        bank_name: profile.bank_details.bank_name || '',
        bank_code: profile.bank_details.bank_code || '',
        account_number: profile.bank_details.account_number || '',
        account_name: profile.bank_details.account_name || '',
      })
    }
  }, [profile])

  const handleBankSelect = (e) => {
    const selectedCode = e.target.value
    const selectedBank = banks.find(b => b.code === selectedCode)
    setForm(prev => ({
      ...prev,
      bank_code: selectedCode,
      bank_name: selectedBank ? selectedBank.name : ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: subAccountData, error: subAccountError } = await supabase.functions.invoke('create-recipient', {
        body: form
      })
      if (subAccountError) throw subAccountError

      const { error: updateError } = await supabase.from('users').update({
        bank_details: {
          ...form,
          subaccount_code: subAccountData.subaccount_code
        }
      }).eq('id', user.id)
      if (updateError) throw updateError

      await refreshProfile()
      toast.success('Bank details saved — you will receive instant payouts on every sale.')
    } catch (err) {
      toast.error(err.context?.data?.error || err.message || 'Failed to save bank details')
    }
    setLoading(false)
  }

  const isVerified = profile?.bank_details?.subaccount_code

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Bank Details</h1>
      <p className="text-sm text-gray-500 mt-1">Payouts are sent automatically to your bank account</p>

      <div className="mt-8 border border-gray-200 rounded-lg">
        {/* Status */}
        {isVerified && (
          <div className="px-5 pt-5">
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
              <CheckCircle size={15} />
              <span className="font-medium">Verified — instant payouts are active</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Account Name</label>
            <input type="text" required value={form.account_name}
              onChange={e => setForm(p => ({ ...p, account_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Account Number</label>
            <input type="text" required maxLength={10} value={form.account_number}
              onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="10-digit account number" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bank</label>
            <select required value={form.bank_code} onChange={handleBankSelect}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white"
              disabled={fetchingBanks}>
              <option value="">{fetchingBanks ? 'Loading banks…' : 'Select your bank'}</option>
              {banks.map(bank => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#0c0c0c] text-white font-semibold text-sm py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Verifying…' : isVerified ? 'Update Bank Details' : 'Save & Verify Bank Details'}
          </button>
        </form>
      </div>
    </div>
  )
}