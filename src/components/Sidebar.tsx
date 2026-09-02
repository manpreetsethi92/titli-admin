import { Link, useLocation } from 'react-router-dom'
import { memo } from 'react'
import { 
  LayoutDashboard, FileText, Zap, Users, Target, Link as LinkIcon, 
  MessageSquare, TrendingUp, ActivitySquare, ChevronLeft, X,
  Bot, Send, Handshake, Briefcase, BarChart2, Star, MapPin, DollarSign,
  Network, Megaphone, Radio, LineChart, Key
} from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/' },
  { id: 'wa-jobs', label: 'WA Group Jobs', icon: Zap, href: '/wa-jobs' },
  { id: 'jobs', label: 'Job Pipeline', icon: FileText, href: '/jobs' },
  { id: 'job-alerts', label: 'Job Alerts', icon: Send, href: '/job-alerts' },
  { id: 'requests', label: 'Requests', icon: Target, href: '/requests' },
  { id: 'matches', label: 'Matches', icon: LinkIcon, href: '/matches' },
  { id: 'connections', label: 'Connections', icon: Handshake, href: '/connections' },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase, href: '/opportunities' },
  { id: 'users', label: 'Users', icon: Users, href: '/users' },
  { id: 'outreach', label: 'Outreach Queue', icon: Send, href: '/outreach' },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare, href: '/messaging' },
  { id: 'ai-costs', label: 'AI Costs', icon: Bot, href: '/ai-costs' },
  { id: 'match-analytics', label: 'Match Analytics', icon: BarChart2, href: '/match-analytics' },
  { id: 'success-stories', label: 'Success Stories', icon: Star, href: '/success-stories' },
  { id: 'category-coverage', label: 'Category Coverage', icon: MapPin, href: '/category-coverage' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, href: '/revenue' },
  { id: 'growth', label: 'Growth', icon: TrendingUp, href: '/growth' },
  { id: 'activity', label: 'Activity', icon: ActivitySquare, href: '/activity' },
  { id: 'intent-graph', label: 'Intent Graph', icon: Network, href: '/intent-graph' },
  { id: 'ads', label: 'Ads & Campaigns', icon: Megaphone, href: '/ads' },
  { id: 'social-listening', label: 'Social Listening', icon: Radio, href: '/social-listening' },
  { id: 'rate-benchmarks', label: 'Rate Benchmarks', icon: TrendingUp, href: '/rate-benchmarks' },
  { id: 'demand-forecasting', label: 'Demand Forecast', icon: LineChart, href: '/demand-forecasting' },
  { id: 'enterprise-api', label: 'Enterprise API', icon: Key, href: '/enterprise-api' },
]

// Memoized nav item — only re-renders when its own isActive state changes
const NavItem = memo(({ item, isActive, showLabel, onClick }: {
  item: typeof navItems[0]
  isActive: boolean
  showLabel: boolean
  onClick: () => void
}) => {
  const Icon = item.icon
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        // transition-colors only — never transition-all (too expensive)
        'transition-colors duration-150',
        isActive
          ? 'bg-accent/20 text-accent border border-accent/30'
          : 'text-gray-300 hover:bg-white/5',
      ].join(' ')}
    >
      <Icon size={20} className="flex-shrink-0" />
      {showLabel && <span className="text-sm font-medium">{item.label}</span>}
    </Link>
  )
})
NavItem.displayName = 'NavItem'

interface SidebarProps {
  open: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ open, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const showLabel = open || !!mobileOpen

  const handleNavClick = () => {
    if (mobileOpen && onMobileClose) onMobileClose()
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onMobileClose} />
      )}

      <aside className={[
        'fixed left-0 top-0 h-screen bg-dark-surface border-r border-dark-border z-50',
        // transition-transform only — avoids triggering layout on width change
        'transition-transform duration-300 md:transition-none',
        mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
        'md:translate-x-0 md:relative md:z-0',
        open ? 'md:w-64' : 'md:w-20',
      ].join(' ')}
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Zap size={24} className="text-accent" />
            </div>
            {showLabel && <div className="font-bold text-lg">GULLY</div>}
          </div>
          <button onClick={onMobileClose} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
          <button onClick={onToggle} className="hidden md:block p-2 hover:bg-white/10 rounded-lg">
            <ChevronLeft size={20} className={`transition-transform duration-150 ${!open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 112px)' }}>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={location.pathname === item.href}
              showLabel={showLabel}
              onClick={handleNavClick}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border">
          <div className={`text-xs text-gray-500 ${showLabel ? '' : 'text-center'}`}>
            {showLabel ? 'Gully Admin' : 'v1'}
          </div>
        </div>
      </aside>
    </>
  )
}
