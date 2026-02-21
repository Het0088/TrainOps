'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { signOut } from '@/lib/firebase-auth'
import { canAccess, ROLE_LABELS, ROLE_COLORS } from '@/lib/permissions'
import {
  LayoutDashboard, MapPin, Calendar, FlaskConical,
  BarChart3, Settings, Train, X, LogOut, User,
  Brain, Bell, ChevronRight
} from 'lucide-react'

const nav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Tracking', href: '/live-tracking', icon: MapPin },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Simulator', href: '/simulator', icon: FlaskConical },
  { name: 'Performance', href: '/performance', icon: BarChart3 },
  { name: 'Integration', href: '/integration', icon: Settings },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  const role = user?.role ?? 'OBSERVER'
  const rc = ROLE_COLORS[role]

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const visibleNav = nav.filter(n => canAccess(role, n.href))

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0',
        'border-r',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
        style={{ background: 'hsl(222 47% 7%)', borderColor: 'hsl(222 47% 14%)' }}
      >
        <div className="flex items-center justify-between h-16 px-5" style={{ borderBottom: '1px solid hsl(222 47% 14%)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Train className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-none">TrainOps AI</div>
              <div className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 50%)' }}>Control Center</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: '1px solid hsl(222 47% 14%)' }}>
          <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'hsl(222 47% 12%)' }}>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                >
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </div>
            <div className="live-dot flex-shrink-0" />
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-wider px-3 pb-2" style={{ color: 'hsl(215 20% 40%)' }}>
            Navigation
          </div>
          {visibleNav.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.name} href={item.href} onClick={onClose}
                className={cn('sidebar-item', active && 'active')}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{item.name}</div>
                </div>
                {active && <ChevronRight className="w-3 h-3 opacity-60" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid hsl(222 47% 14%)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

function Header({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname()
  const title = nav.find(n => n.href === pathname)?.name ?? 'TrainOps AI'

  return (
    <header className="h-14 flex items-center justify-between px-5 flex-shrink-0"
      style={{ background: 'hsl(222 47% 7%)', borderBottom: '1px solid hsl(222 47% 14%)' }}
    >
      <div className="flex items-center gap-4">
        <button onClick={onMenu} className="lg:hidden text-gray-400 hover:text-white p-1">
          <Brain className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: 'hsl(142 71% 45% / 0.1)', color: 'hsl(142 71% 60%)', border: '1px solid hsl(142 71% 45% / 0.2)' }}
        >
          <div className="live-dot" />
          Live
        </div>
        <button className="text-gray-400 hover:text-white p-1.5 rounded-lg transition-colors"
          style={{ background: 'hsl(222 47% 12%)' }}
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="p-5 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}