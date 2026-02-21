import jwt from 'jsonwebtoken'
import { User, Permission } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'trainops-secret-key'

// Mock users for demonstration
const mockUsers: Omit<User, 'permissions'>[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.controller@indianrailways.gov.in',
    role: 'CONTROLLER',
    station: 'New Delhi',
    lastActive: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Priya Singh',
    email: 'priya.admin@indianrailways.gov.in',
    role: 'ADMIN',
    lastActive: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Amit Sharma',
    email: 'amit.observer@indianrailways.gov.in',
    role: 'OBSERVER',
    station: 'Mumbai Central',
    lastActive: new Date().toISOString()
  }
]

// Role-based permissions
export const rolePermissions: Record<User['role'], Permission[]> = {
  CONTROLLER: [
    { resource: 'trains', actions: ['READ', 'WRITE'] },
    { resource: 'recommendations', actions: ['READ', 'APPROVE', 'OVERRIDE'] },
    { resource: 'schedule', actions: ['READ', 'WRITE'] },
    { resource: 'alerts', actions: ['READ', 'WRITE'] },
    { resource: 'simulator', actions: ['READ'] }
  ],
  ADMIN: [
    { resource: 'trains', actions: ['READ', 'WRITE'] },
    { resource: 'recommendations', actions: ['READ', 'WRITE', 'APPROVE', 'OVERRIDE'] },
    { resource: 'schedule', actions: ['READ', 'WRITE'] },
    { resource: 'alerts', actions: ['READ', 'WRITE'] },
    { resource: 'simulator', actions: ['READ', 'WRITE'] },
    { resource: 'users', actions: ['READ', 'WRITE'] },
    { resource: 'system', actions: ['READ', 'WRITE'] }
  ],
  OBSERVER: [
    { resource: 'trains', actions: ['READ'] },
    { resource: 'recommendations', actions: ['READ'] },
    { resource: 'schedule', actions: ['READ'] },
    { resource: 'alerts', actions: ['READ'] },
    { resource: 'simulator', actions: ['READ'] }
  ]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )
}

export function verifyToken(token: string): { userId: string; email: string; role: User['role'] } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    return null
  }
}

export function authenticateUser(credentials: LoginCredentials): AuthResponse {
  // In a real app, this would check against a database with hashed passwords
  const user = mockUsers.find(u => u.email === credentials.email)

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  // For demo purposes, accept any password that's at least 6 characters
  if (credentials.password.length < 6) {
    return { success: false, error: 'Invalid email or password' }
  }

  const userWithPermissions: User = {
    ...user,
    permissions: rolePermissions[user.role]
  }

  const token = generateToken(userWithPermissions)

  return {
    success: true,
    token,
    user: userWithPermissions
  }
}

export function getUserFromToken(token: string): User | null {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const user = mockUsers.find(u => u.id === decoded.userId)
  if (!user) return null

  return {
    ...user,
    permissions: rolePermissions[user.role]
  }
}

export function hasPermission(user: User, resource: string, action: Permission['actions'][0]): boolean {
  const permission = user.permissions.find(p => p.resource === resource)
  return permission ? permission.actions.includes(action) : false
}