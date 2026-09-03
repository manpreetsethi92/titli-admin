import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import WAGroupJobs from './pages/WAGroupJobs'
import JobPipeline from './pages/JobPipeline'
import JobAlerts from './pages/JobAlerts'
import Requests from './pages/Requests'
import Matches from './pages/Matches'
import Users from './pages/Users'
import Messaging from './pages/Messaging'
import Growth from './pages/Growth'
import ActivityLog from './pages/ActivityLog'
import AICosts from './pages/AICosts'
import OutreachQueue from './pages/OutreachQueue'
import Connections from './pages/Connections'
import Opportunities from './pages/Opportunities'
import MatchAnalytics from './pages/MatchAnalytics'
import SuccessStories from './pages/SuccessStories'
import CategoryCoverage from './pages/CategoryCoverage'
import RevenueAttribution from './pages/RevenueAttribution'
import Login from './pages/Login'
import IntentGraph from './pages/IntentGraph'
import AdsCampaigns from './pages/AdsCampaigns'
import SocialListening from './pages/SocialListening'
import RateBenchmarks from './pages/RateBenchmarks'
import DemandForecasting from './pages/DemandForecasting'
import EnterpriseAPI from './pages/EnterpriseAPI'

const SESSION_KEY = 'gully_admin_auth'

function ProtectedLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <Layout onLogout={onLogout}>
      <Outlet />
    </Layout>
  )
}

function App() {
  const [authed, setAuthed] = useState(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    return stored === 'true'
  })

  const handleLogin = () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setAuthed(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout onLogout={handleLogout} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wa-jobs" element={<WAGroupJobs />} />
          <Route path="/jobs" element={<JobPipeline />} />
          <Route path="/job-alerts" element={<JobAlerts />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/users" element={<Users />} />
          <Route path="/messaging" element={<Messaging />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/ai-costs" element={<AICosts />} />
          <Route path="/outreach" element={<OutreachQueue />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/match-analytics" element={<MatchAnalytics />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/category-coverage" element={<CategoryCoverage />} />
          <Route path="/revenue" element={<RevenueAttribution />} />
          <Route path="/intent-graph" element={<IntentGraph />} />
          <Route path="/ads" element={<AdsCampaigns />} />
          <Route path="/social-listening" element={<SocialListening />} />
          <Route path="/rate-benchmarks" element={<RateBenchmarks />} />
          <Route path="/demand-forecasting" element={<DemandForecasting />} />
          <Route path="/enterprise-api" element={<EnterpriseAPI />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
