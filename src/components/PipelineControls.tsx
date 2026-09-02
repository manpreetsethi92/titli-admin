import { useEffect, useState } from 'react'
import { Download, Filter, Send, Loader2 } from 'lucide-react'
import {
  fetchJobAlertStats,
  triggerScrape,
  triggerProcessQueue,
  triggerJobAlerts,
} from '../utils/api'
import { formatRelativeTime } from '../utils/format'

const SOURCES = ['reddit', 'twitter', 'facebook', 'craigslist', 'threads']

interface AlertStats {
  sent_7d: number
  users_reached_7d: number
  last_sent_at: string | null
  eligible_recipients: number
}

interface Props {
  /** Refresh the parent page's funnel numbers after an action changes them. */
  onDone: () => void
}

export default function PipelineControls({ onDone }: Props) {
  const [source, setSource] = useState(SOURCES[0])
  const [running, setRunning] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null)

  const loadAlertStats = () => {
    fetchJobAlertStats().then(setAlertStats).catch(() => setAlertStats(null))
  }
  useEffect(loadAlertStats, [])

  // Every action shares this wrapper so a failure can never leave the buttons
  // disabled — `running` is always cleared, whatever the outcome.
  const run = async (label: string, fn: () => Promise<any>, describe: (d: any) => string) => {
    setRunning(label)
    setError(null)
    setResult(null)
    try {
      const data = await fn()
      setResult(`${label} — ${describe(data)}`)
      loadAlertStats()
      onDone()
    } catch (e: any) {
      setError(`${label} failed — ${e?.response?.data?.detail || e?.message || 'unknown error'}`)
    } finally {
      setRunning(null)
    }
  }

  const busy = running !== null
  const recipients = alertStats?.eligible_recipients ?? 0

  const btn = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold">Run Pipeline</h2>
        {alertStats?.last_sent_at && (
          <span className="text-xs text-gray-500">
            Last alert sent {formatRelativeTime(alertStats.last_sent_at)}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-5">
        Each step feeds the funnel below. Run them in order.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          disabled={busy}
          className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm disabled:opacity-40"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          disabled={busy}
          onClick={() => run('Scrape', () => triggerScrape(source),
            (d) => `${d.inserted ?? d.count ?? 0} jobs added from ${source}`)}
          className={`${btn} bg-gray-800 hover:bg-gray-700 text-gray-300`}
        >
          {running === 'Scrape' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          1. Scrape Jobs
        </button>

        <button
          disabled={busy}
          onClick={() => run('Classify', triggerProcessQueue,
            (d) => `${d.processed ?? 0} processed, ${d.failed ?? 0} failed`)}
          className={`${btn} bg-gray-800 hover:bg-gray-700 text-gray-300`}
        >
          {running === 'Classify' ? <Loader2 size={16} className="animate-spin" /> : <Filter size={16} />}
          2. Classify Queue
        </button>

        <button
          disabled={busy || recipients === 0}
          onClick={() => setConfirming(true)}
          title={recipients === 0 ? 'No users are eligible for job alerts' : undefined}
          className={`${btn} bg-accent hover:bg-accent/90 text-white`}
        >
          {running === 'Send' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          3. Send Alerts{recipients > 0 ? ` (${recipients})` : ''}
        </button>
      </div>

      {result && <p className="mt-4 text-sm text-green-400">{result}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {/* Send is the only irreversible action here, so it confirms first. */}
      {confirming && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            className="bg-dark-surface border border-dark-border rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">Send job alerts?</h2>
            <p className="text-gray-300 mb-4">
              This sends a WhatsApp message to{' '}
              <span className="font-semibold text-white">{recipients} user{recipients === 1 ? '' : 's'}</span>{' '}
              immediately, with up to 5 job titles each. It cannot be undone.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Check the funnel below first — unclassified jobs can still be sent.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirming(false)
                  run('Send', () => triggerJobAlerts('morning'),
                    (d) => `${d.sent_to ?? 0} users messaged, ${d.total_jobs_sent ?? 0} jobs sent`)
                }}
                className="flex-1 px-4 py-2 bg-accent rounded-lg text-white font-medium hover:opacity-90"
              >
                Send to {recipients}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 px-4 py-2 border border-dark-border rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
