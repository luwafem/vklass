import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/helpers'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setLogs(data || []))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 md:py-12">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">System Logs</h1>
      <p className="text-sm text-gray-500 mt-1">{logs.length} entries</p>

      {logs.length === 0 ? (
        <div className="mt-6 border border-gray-200 rounded-lg py-12 text-center">
          <p className="text-sm text-gray-500">No logs yet.</p>
        </div>
      ) : (
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Time</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Function</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Level</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2.5 px-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(l => (
                  <tr key={l.id} className={l.level === 'error' ? 'bg-red-50/50' : ''}>
                    <td className="py-2 px-4 text-gray-400 whitespace-nowrap">{formatDate(l.created_at)}</td>
                    <td className="py-2 px-4 text-gray-700 font-medium">{l.function_name}</td>
                    <td className="py-2 px-4">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        l.level === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {l.level}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-600 break-all">{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}