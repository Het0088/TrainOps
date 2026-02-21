'use client'

import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { canAccess, ROLE_LABELS, ROLE_COLORS } from '@/lib/permissions'
import { ShieldOff } from 'lucide-react'

interface RoleGuardProps {
    children: React.ReactNode
    allowed: User['role'][]
    path?: string
}

export default function RoleGuard({ children, allowed, path }: RoleGuardProps) {
    const { user, isAuthenticated, loading } = useAuthStore()

    if (loading) return null

    if (!isAuthenticated || !user) return null

    if (!allowed.includes(user.role)) {
        const c = ROLE_COLORS[user.role]
        return (
            <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                    style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.2)' }}>
                    <ShieldOff className="w-7 h-7 text-red-400" />
                </div>
                <div className="text-lg font-bold text-white">Access Denied</div>
                <div className="text-sm text-center max-w-xs" style={{ color: 'hsl(215 20% 50%)' }}>
                    This page requires one of: <strong className="text-white">{allowed.map(r => ROLE_LABELS[r]).join(', ')}</strong>
                </div>
                <div className="text-xs px-3 py-1 rounded-full border font-medium mt-1"
                    style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                    Your role: {ROLE_LABELS[user.role]}
                </div>
            </div>
        )
    }

    return <>{children}</>
}
