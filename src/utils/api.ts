import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.trygully.com/api'
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'gully-admin-secret-123'

// Sanity check — ensure we never accidentally use the old Railway URL
if (API_BASE.includes('railway.app') || API_BASE.includes('titly-backend')) {
  console.error('WRONG API URL DETECTED — should be api.trygully.com')
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'x-admin-secret': ADMIN_SECRET,
  },
})

export const fetchDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/overview')
  return response.data
}

export const fetchWAGroupJobs = async (filters?: any) => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.group_name) params.append('group_name', filters.group_name)
  if (filters?.limit) params.append('limit', filters.limit)
  if (filters?.skip) params.append('skip', filters.skip)
  const response = await api.get(`/wa-group/jobs?${params}`)
  return response.data
}

export const fetchRequests = async (limit = 200, page = 1) => {
  const response = await api.get(`/admin/dashboard/requests?limit=${limit}&page=${page}`)
  return response.data
}
export const fetchMatches = async (limit = 500) => {
  const response = await api.get(`/admin/matches?limit=${limit}`)
  return response.data
}

export const fetchUsers = async (limit = 200, page = 1) => {
  const response = await api.get(`/admin/dashboard/users?limit=${limit}&page=${page}`)
  return response.data
}

export const fetchUserDetail = async (userId: string) => {
  const response = await api.get(`/admin/dashboard/users/${userId}`)
  return response.data
}

export const fetchGrowthDaily = async () => {
  const response = await api.get('/admin/analytics/growth')
  return response.data
}

export const fetchFunnel = async () => {
  const response = await api.get('/admin/analytics/funnel')
  return response.data
}

export const fetchJobQueueStats = async () => {
  const response = await api.get('/admin/job-queue/stats')
  return response.data
}

export const fetchBlastStats = async () => {
  const response = await api.get('/admin/blast/stats')
  return response.data
}

export const fetchBlastToday = async () => {
  const response = await api.get('/admin/blast/today')
  return response.data
}
export const fetchActivityLog = async (limit = 50) => {
  const response = await api.get(`/admin/activity?limit=${limit}`)
  return response.data
}

export const triggerWAJobMatching = async (jobId: string) => {
  const response = await api.post(`/wa-group/jobs/${jobId}/match`)
  return response.data
}

// ── Pipeline triggers ─────────────────────────────────────
// Scraping and classification run inline and routinely exceed the client's
// default 10s timeout, so each trigger sets its own.
const LONG = { timeout: 180000 }

export const fetchJobAlertStats = async () => {
  const response = await api.get('/admin/job-alerts/stats')
  return response.data
}

export const fetchJobAlertHistory = async (limit = 500) => {
  const response = await api.get(`/admin/job-alerts/history?limit=${limit}`)
  return response.data
}

export const triggerScrape = async (source: string) => {
  const response = await api.post(`/admin/scrape/${source}`, null, LONG)
  return response.data
}

export const triggerProcessQueue = async () => {
  const response = await api.post('/admin/process-queue', null, LONG)
  return response.data
}

export const triggerJobAlerts = async (timeOfDay = 'morning') => {
  const response = await api.post(
    `/admin/send-job-alerts?time_of_day=${timeOfDay}`, null, LONG)
  return response.data
}

export const fetchAICosts = async (days = 30) => {
  const response = await api.get(`/admin/dashboard/ai-costs?days=${days}`)
  return response.data
}

export const fetchOutreachDashboard = async () => {
  const response = await api.get('/passive/outreach-dashboard')
  return response.data
}

export const markOutreachSent = async (outreachId: string) => {
  const response = await api.post(`/passive/outreach/${outreachId}/mark-sent`)
  return response.data
}

export const markOutreachReplied = async (outreachId: string) => {
  const response = await api.post(`/passive/outreach/${outreachId}/mark-replied`)
  return response.data
}

export const fetchConnections = async (limit = 50) => {
  const response = await api.get(`/admin/dashboard/connections?limit=${limit}`)
  return response.data
}

export const fetchOpportunities = async (limit = 50) => {
  const response = await api.get(`/admin/dashboard/opportunities?limit=${limit}`)
  return response.data
}

export const fetchBlastContacts = async (limit = 1000) => {
  const response = await api.get(`/admin/blast/contacts?limit=${limit}`)
  return response.data
}

export const sendBlastMessages = async (phones: string[], message: string) => {
  const response = await api.post('/admin/blast/send', { phones, message })
  return response.data
}

export const fetchHealthStatus = async () => {
  const response = await api.get('/admin/dashboard/health')
  return response.data
}

export const fetchSuccessStories = async () => {
  const response = await api.get('/admin/success-stories')
  return response.data
}

export const approveSuccessStory = async (matchId: string) => {
  const response = await api.post(`/admin/success-stories/${matchId}/approve`)
  return response.data
}

export const fetchCategoryCoverage = async () => {
  const response = await api.get('/admin/category-coverage')
  return response.data
}

export const fetchRevenueAttribution = async () => {
  const response = await api.get('/admin/revenue-attribution')
  return response.data
}

export const fetchUserMesh = async (userId: string) => {
  const response = await api.get(`/admin/dashboard/users/${userId}/mesh`)
  return response.data
}

// ── Intent Graph ─────────────────────────────────────────
const fetchIntentGraphAll = async () => {
  const res = await api.get('/admin/intent-graph')
  return res.data
}
export const fetchIntentGraphNodes = async () => {
  const d = await fetchIntentGraphAll(); return { nodes: d.nodes || [] }
}
export const fetchCollabEdges = async () => {
  const d = await fetchIntentGraphAll(); return { edges: d.edges || [] }
}
export const fetchMicroTeams = async () => {
  const d = await fetchIntentGraphAll(); return { teams: d.teams || [] }
}
export const fetchSkillAffinity = async () => {
  const d = await fetchIntentGraphAll(); return { affinity: d.affinity || [] }
}
export const fetchTrustPropagation = async () => {
  const d = await fetchIntentGraphAll(); return { vouches: d.vouches || [] }
}

// ── Social Listening ──────────────────────────────────────
const fetchSocialListeningAll = async () => {
  const res = await api.get('/admin/social-listening')
  return res.data
}
export const fetchLiveSignalFeed = async () => {
  const d = await fetchSocialListeningAll(); return { signals: d.signals || [] }
}
export const fetchSignalConversionRate = async () => {
  const d = await fetchSocialListeningAll(); return { metrics: d.metrics || null }
}
export const fetchSignalConfidence = async () => {
  const d = await fetchSocialListeningAll(); return { distribution: d.distribution || [] }
}
export const fetchUnfilledSignals = async () => {
  const d = await fetchSocialListeningAll(); return { unfilled: d.unfilled || [] }
}

// ── Ads & Campaigns ───────────────────────────────────────
const fetchAdsCampaignsAll = async () => {
  const res = await api.get('/admin/ads-campaigns')
  return res.data
}
export const fetchActiveCampaigns = async () => {
  const d = await fetchAdsCampaignsAll(); return { campaigns: d.campaigns || [] }
}
export const fetchCampaignPerformance = async () => {
  const d = await fetchAdsCampaignsAll(); return { metrics: d.metrics || [] }
}
export const fetchAdRevenueDashboard = async () => {
  const d = await fetchAdsCampaignsAll(); return { revenue: d.revenue || null }
}
export const fetchGigAdvances = async () => {
  const d = await fetchAdsCampaignsAll(); return { advances: d.advances || [] }
}
export const fetchAdvanceRepayment = async () => {
  const d = await fetchAdsCampaignsAll(); return { repayments: d.repayments || [] }
}

// ── Rate Benchmarks ───────────────────────────────────────
const fetchRateBenchmarksAll = async () => {
  const res = await api.get('/admin/rate-benchmarks')
  return res.data
}
export const fetchRateBenchmarks = async () => {
  const d = await fetchRateBenchmarksAll(); return { benchmarks: d.benchmarks || [] }
}
export const fetchRateTrends = async () => {
  const d = await fetchRateBenchmarksAll(); return { trends: d.trends || [] }
}
export const fetchBenchmarkAccuracy = async () => {
  const d = await fetchRateBenchmarksAll(); return { accuracy: d.accuracy || [] }
}

// ── Demand Forecasting ────────────────────────────────────
const fetchDemandForecastAll = async () => {
  const res = await api.get('/admin/demand-forecast')
  return res.data
}
export const fetchDemandForecast = async () => {
  const d = await fetchDemandForecastAll(); return { forecasts: d.forecasts || [] }
}
export const fetchSeasonalTrends = async () => {
  const d = await fetchDemandForecastAll(); return { trends: d.trends || [] }
}
export const fetchForecastAccuracy = async () => {
  const d = await fetchDemandForecastAll(); return { accuracy: d.accuracy || [] }
}

// ── Enterprise API ────────────────────────────────────────
const fetchEnterpriseAPIAll = async () => {
  const res = await api.get('/admin/enterprise-api')
  return res.data
}
export const fetchAPIKeys = async () => {
  const d = await fetchEnterpriseAPIAll(); return { keys: d.keys || [] }
}
export const fetchEnterpriseClients = async () => {
  const d = await fetchEnterpriseAPIAll(); return { clients: d.clients || [] }
}
export const fetchAPIUsageBilling = async () => {
  const d = await fetchEnterpriseAPIAll(); return { usage: d.usage || [] }
}

export default api