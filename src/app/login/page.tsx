'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase-auth'
import { Train, Shield, Users, Eye, ArrowRight, Zap } from 'lucide-react'

const demoUsers = [
  { name: 'Rajesh Kumar', email: 'rajesh.controller@indianrailways.gov.in', pass: 'demo123456', role: 'Controller', icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  { name: 'Priya Singh', email: 'priya.admin@indianrailways.gov.in', pass: 'demo123456', role: 'Admin', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { name: 'Amit Sharma', email: 'amit.observer@indianrailways.gov.in', pass: 'demo123456', role: 'Observer', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated, loading: authLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, authLoading, router])

  const handleEmail = async (e: string, p: string) => {
    setLoading(true)
    setError('')
    try {
      await signInWithEmail(e, p)
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
      } else {
        setError(err?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 5%)' }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(222 47% 5%)' }}>
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 relative overflow-hidden"
        style={{ background: 'hsl(222 47% 7%)', borderRight: '1px solid hsl(222 47% 14%)' }}
      >
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, hsl(217 91% 60% / 0.2) 0%, transparent 70%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TrainOps AI</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Indian Railways<br />Operations Center
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(215 20% 55%)' }}>
            AI-powered scheduling and disruption management for the Mumbai–Delhi corridor.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            { label: 'Active Trains', value: '30', color: 'text-blue-400' },
            { label: 'On-Time Rate', value: '94%', color: 'text-green-400' },
            { label: 'Avg Delay', value: '8 min', color: 'text-yellow-400' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
              style={{ background: 'hsl(222 47% 10%)', border: '1px solid hsl(222 47% 16%)' }}
            >
              <span className="text-sm" style={{ color: 'hsl(215 20% 55%)' }}>{stat.label}</span>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
          <p className="text-xs text-center pt-2" style={{ color: 'hsl(215 20% 40%)' }}>
            © 2026 Indian Railways — TrainOps AI
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden text-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mx-auto mb-3">
              <Train className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">TrainOps AI</h1>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Sign in</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 55%)' }}>Access the operations dashboard</p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'hsl(222 47% 12%)', border: '1px solid hsl(222 47% 22%)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'hsl(222 47% 16%)' }} />
            <span className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'hsl(222 47% 16%)' }} />
          </div>

          <form onSubmit={e => { e.preventDefault(); handleEmail(email, password) }} className="space-y-4">
            {[
              { field: 'email', type: 'email', placeholder: 'your@email.com', val: email, set: setEmail },
              { field: 'password', type: 'password', placeholder: '••••••••', val: password, set: setPassword },
            ].map(f => (
              <div key={f.field}>
                <label className="block text-xs font-medium mb-1.5 capitalize" style={{ color: 'hsl(215 20% 65%)' }}>
                  {f.field}
                </label>
                <input
                  type={f.type}
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{ background: 'hsl(222 47% 10%)', border: '1px solid hsl(222 47% 20%)' }}
                  onFocus={e => e.target.style.borderColor = 'hsl(217 91% 60%)'}
                  onBlur={e => e.target.style.borderColor = 'hsl(222 47% 20%)'}
                />
              </div>
            ))}

            {error && (
              <div className="text-xs px-3 py-2 rounded-lg text-red-400" style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.2)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'hsl(217 91% 60%)' }}
            >
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px" style={{ background: 'hsl(222 47% 16%)' }} />
              <span className="text-xs" style={{ color: 'hsl(215 20% 45%)' }}>Quick Demo Login</span>
              <div className="flex-1 h-px" style={{ background: 'hsl(222 47% 16%)' }} />
            </div>
            <div className="space-y-2">
              {demoUsers.map(u => (
                <button
                  key={u.email}
                  onClick={() => handleEmail(u.email, u.pass)}
                  disabled={loading}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${u.bg} border ${u.border} hover:opacity-90 disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2.5">
                    <u.icon className={`w-4 h-4 ${u.color}`} />
                    <div>
                      <div className="text-sm font-medium text-white">{u.name}</div>
                      <div className="text-xs" style={{ color: 'hsl(215 20% 50%)' }}>{u.role}</div>
                    </div>
                  </div>
                  <Zap className={`w-3.5 h-3.5 ${u.color} opacity-70`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}