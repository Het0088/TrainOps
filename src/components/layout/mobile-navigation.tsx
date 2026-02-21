import { useState, useEffect } from 'react'
import { ChevronDown, Menu, X, Bell, User, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { AccessibleBadge } from '@/components/ui/accessible-badge'

interface MobileNavigationProps {
  currentPath: string
  onNavigate: (path: string) => void
}

export function MobileNavigation({ currentPath, onNavigate }: MobileNavigationProps) {
  const { user, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications] = useState(3) // Mock notification count

  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/live-tracking', label: 'Live Tracking', icon: '🚂' },
    { path: '/recommendations', label: 'AI Recommendations', icon: '🤖' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/simulator', label: 'Simulator', icon: '⚡' },
    { path: '/performance', label: 'Performance', icon: '📊' },
    { path: '/integration', label: 'Integration', icon: '🔗' },
  ]

  const handleNavigation = (path: string) => {
    onNavigate(path)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <AccessibleButton
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </AccessibleButton>
            <h1 className="text-lg font-semibold">TrainOps AI</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <AccessibleButton
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </AccessibleButton>
            
            <div className="relative">
              <AccessibleButton
                variant="ghost"
                size="icon"
                aria-label={`Notifications (${notifications} unread)`}
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <AccessibleBadge
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                    ariaLabel={`${notifications} unread notifications`}
                  >
                    {notifications}
                  </AccessibleBadge>
                )}
              </AccessibleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-menu"
            className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-80 max-w-[80vw] bg-background border-r"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex h-full flex-col">
              {/* User Info */}
              <div className="border-b p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.role || 'Observer'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = currentPath === item.path
                    return (
                      <AccessibleButton
                        key={item.path}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-left"
                        onClick={() => handleNavigation(item.path)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="mr-3" aria-hidden="true">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </AccessibleButton>
                    )
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t p-4 space-y-2">
                <AccessibleButton
                  variant="ghost"
                  className="w-full justify-start"
                  icon={<Settings className="h-4 w-4" />}
                >
                  Settings
                </AccessibleButton>
                <AccessibleButton
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                  icon={<LogOut className="h-4 w-4" />}
                >
                  Logout
                </AccessibleButton>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}