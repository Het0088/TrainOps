import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface AccessibleBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'default' | 'lg'
  icon?: React.ReactNode
  ariaLabel?: string
}

const AccessibleBadge = forwardRef<HTMLDivElement, AccessibleBadgeProps>(
  ({ className, variant = 'default', size = 'default', icon, ariaLabel, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
    
    const variants = {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-foreground border-border',
      success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
      warning: 'border-transparent bg-yellow-500 text-black hover:bg-yellow-600',
    }
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      default: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        role="status"
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {icon && (
          <span className="mr-1" aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{children}</span>
      </div>
    )
  }
)

AccessibleBadge.displayName = 'AccessibleBadge'

export { AccessibleBadge }