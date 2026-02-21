import type { User } from '@/types'

type Role = User['role']

export const ROLE_NAV: Record<string, Role[]> = {
    '/dashboard': ['OBSERVER', 'CONTROLLER', 'ADMIN'],
    '/live-tracking': ['OBSERVER', 'CONTROLLER', 'ADMIN'],
    '/performance': ['OBSERVER', 'CONTROLLER', 'ADMIN'],
    '/schedule': ['OBSERVER', 'CONTROLLER', 'ADMIN'],
    '/recommendations': ['OBSERVER', 'CONTROLLER', 'ADMIN'],
    '/simulator': ['CONTROLLER', 'ADMIN'],
    '/integration': ['ADMIN'],
}

export const ROLE_LABELS: Record<Role, string> = {
    OBSERVER: 'Observer',
    CONTROLLER: 'Controller',
    ADMIN: 'Admin',
}

export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
    OBSERVER: { bg: 'hsl(217 91% 60% / 0.15)', text: 'hsl(217 91% 70%)', border: 'hsl(217 91% 60% / 0.3)' },
    CONTROLLER: { bg: 'hsl(142 71% 45% / 0.15)', text: 'hsl(142 71% 55%)', border: 'hsl(142 71% 45% / 0.3)' },
    ADMIN: { bg: 'hsl(271 91% 65% / 0.15)', text: 'hsl(271 91% 75%)', border: 'hsl(271 91% 65% / 0.3)' },
}

export function canAccess(role: Role, path: string): boolean {
    const allowed = ROLE_NAV[path]
    if (!allowed) return true
    return allowed.includes(role)
}

const rolePermissions: Record<Role, Record<string, string[]>> = {
    OBSERVER: { trains: ['READ'], schedule: ['READ'], alerts: ['READ'], recommendations: ['READ'] },
    CONTROLLER: { trains: ['READ', 'WRITE'], schedule: ['READ', 'WRITE'], alerts: ['READ', 'WRITE'], recommendations: ['READ', 'APPROVE', 'OVERRIDE'], simulator: ['READ', 'WRITE'] },
    ADMIN: { trains: ['READ', 'WRITE'], schedule: ['READ', 'WRITE'], alerts: ['READ', 'WRITE'], recommendations: ['READ', 'WRITE', 'APPROVE', 'OVERRIDE'], simulator: ['READ', 'WRITE'], system: ['READ', 'WRITE'], users: ['READ', 'WRITE'] },
}

export function can(role: Role, resource: string, action: string): boolean {
    return rolePermissions[role]?.[resource]?.includes(action) ?? false
}
