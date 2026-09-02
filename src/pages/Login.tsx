import { useState } from 'react'
import { Zap, Eye, EyeOff } from 'lucide-react'

// SECURITY WARNING: Client-side password check is NOT secure!
// This should be replaced with proper backend authentication.
// For now, password is moved to environment variable.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || ''

if (!ADMIN_PASSWORD) {
  console.error('VITE_ADMIN_PASSWORD not set - admin login will not work')
}

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError('Invalid password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">Gully Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Admin password"
              className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 pr-12"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-accent rounded-lg text-white font-medium hover:bg-accent/90 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}