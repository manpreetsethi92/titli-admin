import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import { FileText, CheckCircle, AlertCircle, Zap, XCircle, Send } from 'lucide-react'
import { fetchJobQueueStats, fetchJobAlertStats } from '../utils/api'
import PipelineControls from '../components/PipelineControls'

interface PipelineStats {
  raw_jobs: { total: number; queued: number; rejected_heuristic: number; processed: number }
  job_queue: { pending: number; processing: number; completed: number; failed: number }
}

export default function JobPipeline() {
  const [stats, setStats] = useState<PipelineStats | null>(null)
  const [alertsSent, setAlertsSent] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [data, alerts] = await Promise.all([
        fetchJobQueueStats(),
        fetchJobAlertStats().catch(() => null),
      ])
      setStats(data)
      setAlertsSent(alerts?.sent_7d ?? null)
    } catch (err) {
      console.error('Failed to load pipeline stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading pipeline...</div>
  if (!stats) return <div className="text-center py-8 text-red-400">Failed to load pipeline data</div>
  const passRate = stats.raw_jobs.total > 0
    ? Math.round((stats.raw_jobs.processed / stats.raw_jobs.total) * 100)
    : 0

  const stages = [
    { label: 'Total Scraped', value: stats.raw_jobs.total, color: 'bg-blue-500', pct: 100 },
    { label: 'Queued', value: stats.raw_jobs.queued, color: 'bg-yellow-500', pct: stats.raw_jobs.total > 0 ? Math.round((stats.raw_jobs.queued / stats.raw_jobs.total) * 100) : 0 },
    { label: 'Rejected (Heuristic)', value: stats.raw_jobs.rejected_heuristic, color: 'bg-red-500', pct: stats.raw_jobs.total > 0 ? Math.round((stats.raw_jobs.rejected_heuristic / stats.raw_jobs.total) * 100) : 0 },
    { label: 'Processed', value: stats.raw_jobs.processed, color: 'bg-green-500', pct: passRate },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Pipeline</h1>
        <p className="text-gray-400 text-sm mt-1">Monitor the job processing pipeline from scrape to notification</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Total Scraped" value={stats.raw_jobs.total} icon={<FileText size={20} />} index={0} />
        <StatCard label="Rejected" value={stats.raw_jobs.rejected_heuristic} icon={<XCircle size={20} />} index={4} />
        <StatCard label="Processed" value={stats.raw_jobs.processed} icon={<CheckCircle size={20} />} index={1} />
        <StatCard label="Queue Pending" value={stats.job_queue.pending} icon={<Zap size={20} />} index={2} />
        <StatCard label="Failed" value={stats.job_queue.failed} icon={<AlertCircle size={20} />} index={4} />
        <StatCard label="Alerts Sent (7d)" value={alertsSent ?? '—'} icon={<Send size={20} />} index={3} />
      </div>

      <PipelineControls onDone={load} />
      {/* Pipeline Funnel */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Pipeline Stages</h2>
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{stage.label}</span>
                <span className="font-semibold">{stage.value.toLocaleString()} ({stage.pct}%)</span>
              </div>
              <div className="h-3 bg-dark-bg rounded-full overflow-hidden">
                <div className={`h-full ${stage.color} rounded-full transition-all duration-500`} style={{ width: `${stage.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Queue Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-400">Pending</span><span className="font-semibold text-yellow-400">{stats.job_queue.pending}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Processing</span><span className="font-semibold text-blue-400">{stats.job_queue.processing}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Completed</span><span className="font-semibold text-green-400">{stats.job_queue.completed}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Failed</span><span className={`font-semibold ${stats.job_queue.failed > 0 ? 'text-red-400' : 'text-green-400'}`}>{stats.job_queue.failed}</span></div>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Pass Rate</h2>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-5xl font-bold text-accent">{passRate}%</div>
              <div className="text-gray-400 text-sm mt-2">of scraped jobs pass filters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}