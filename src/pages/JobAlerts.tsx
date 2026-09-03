import { useEffect, useMemo, useState } from 'react'
import { Send, Users, Briefcase, ExternalLink, Search, RefreshCw } from 'lucide-react'
import StatCard from '../components/StatCard'
import ErrorState from '../components/ErrorState'
import { fetchJobAlertHistory } from '../utils/api'
import { formatRelativeTime, formatPhone } from '../utils/format'

interface Alert {
  sent_at: string
  batch: string
  message_sid: string
  user_id: string
  job_id: string
  user_name: string | null
  user_phone: string | null
  job_title: string | null
  job_url: string | null
  job_source: string | null
  job_location: string | null
}

type Mode = 'user' | 'job'

/** Group alerts by whichever side of the pairing is being viewed. */
function group(alerts: Alert[], mode: Mode) {
  const out = new Map<string, { title: string; subtitle: string; rows: Alert[] }>()
  for (const a of alerts) {
    const key = mode === 'user' ? a.user_id : a.job_id
    if (!out.has(key)) {
      out.set(key, mode === 'user'
        ? { title: a.user_name || '(user record gone)',
            subtitle: a.user_phone ? formatPhone(a.user_phone) : a.user_id,
            rows: [] }
        : { title: a.job_title || '(job record pruned)',
            subtitle: [a.job_source, a.job_location].filter(Boolean).join(' · ') || a.job_id,
            rows: [] })
    }
    out.get(key)!.rows.push(a)
  }
  // busiest first — the useful reading is who got the most, or what went widest
  return [...out.entries()].sort((a, b) => b[1].rows.length - a[1].rows.length)
}

export default function JobAlerts() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [mode, setMode] = useState<Mode>('user')
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    setFailed(false)
    try {
      const data = await fetchJobAlertHistory()
      setAlerts(data.alerts || [])
    } catch (err) {
      console.error('Failed to load job alert history:', err)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!alerts) return []
    const t = q.trim().toLowerCase()
    if (!t) return alerts
    return alerts.filter(a =>
      (a.user_name || '').toLowerCase().includes(t) ||
      (a.job_title || '').toLowerCase().includes(t) ||
      (a.user_phone || '').includes(t))
  }, [alerts, q])

  const groups = useMemo(() => group(filtered, mode), [filtered, mode])

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading job alerts...</div>
  if (failed) return <ErrorState message="Failed to load job alert history" onRetry={load} />

  const users = new Set(filtered.map(a => a.user_id)).size
  const jobs = new Set(filtered.map(a => a.job_id)).size

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Alerts</h1>
          <p className="text-gray-400 text-sm mt-1">
            Who was sent which job. Pruned to the last 7 days, so this is a rolling log.
          </p>
        </div>
        <button onClick={load} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Alerts Sent" value={filtered.length} icon={<Send size={20} />} index={0} />
        <StatCard label="Users Reached" value={users} icon={<Users size={20} />} index={1} />
        <StatCard label="Jobs Shared" value={jobs} icon={<Briefcase size={20} />} index={2} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-dark-border overflow-hidden">
          {(['user', 'job'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm transition-colors ${
                mode === m ? 'bg-accent text-white' : 'bg-dark-surface text-gray-400 hover:bg-white/5'}`}
            >
              {m === 'user' ? 'By User' : 'By Job'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 flex-1 max-w-md">
          <Search size={16} className="text-gray-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Filter by user or job title..."
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-8 text-center text-gray-400">
          {alerts?.length ? 'No alerts match that filter.' : 'No job alerts have been sent in the last 7 days.'}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([key, g]) => (
            <div key={key} className="bg-dark-surface border border-dark-border rounded-lg p-5">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <h2 className="font-semibold">{g.title}</h2>
                  <p className="text-xs text-gray-500">{g.subtitle}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-4">
                  {g.rows.length} {mode === 'user' ? 'job' : 'recipient'}{g.rows.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="divide-y divide-dark-border">
                {g.rows.map(a => (
                  <div key={`${a.user_id}-${a.job_id}-${a.sent_at}`}
                       className="py-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-300 truncate">
                      {mode === 'user'
                        ? (a.job_title || '(job record pruned)')
                        : (a.user_name || a.user_id)}
                    </span>
                    <span className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                      <span>{a.batch}</span>
                      <span>{formatRelativeTime(a.sent_at)}</span>
                      {a.job_url && (
                        <a href={a.job_url} target="_blank" rel="noreferrer"
                           className="text-gray-400 hover:text-white" title="Open the original posting">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
