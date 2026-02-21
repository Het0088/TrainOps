import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ResponsiveCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  size?: 'sm' | 'default' | 'lg'
  interactive?: boolean
}

const ResponsiveCard = forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ className, variant = 'default', size = 'default', interactive = false, ...props }, ref) => {
    const baseClasses = 'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200'
    
    const variants = {
      default: '',
      elevated: 'shadow-lg hover:shadow-xl',
      outlined: 'border-2',
    }
    
    const sizes = {
      sm: 'p-3',
      default: 'p-6',
      lg: 'p-8',
    }
    
    const interactiveClasses = interactive 
      ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      : ''

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          interactiveClasses,
          // Responsive classes
          'w-full',
          'sm:max-w-none',
          className
        )}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      />
    )
  }
)

ResponsiveCard.displayName = 'ResponsiveCard'

const ResponsiveCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 pb-6',
        // Responsive padding
        'sm:pb-4 md:pb-6',
        className
      )}
      {...props}
    />
  )
)

ResponsiveCardHeader.displayName = 'ResponsiveCardHeader'

const ResponsiveCardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        // Responsive text sizing
        'text-lg sm:text-xl md:text-2xl',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)

ResponsiveCardTitle.displayName = 'ResponsiveCardTitle'

const ResponsiveCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-muted-foreground',
        // Responsive text sizing
        'text-xs sm:text-sm',
        className
      )}
      {...props}
    />
  )
)

ResponsiveCardDescription.displayName = 'ResponsiveCardDescription'

const ResponsiveCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'pt-0',
        // Responsive spacing
        'space-y-4 sm:space-y-6',
        className
      )}
      {...props}
    />
  )
)

ResponsiveCardContent.displayName = 'ResponsiveCardContent'

const ResponsiveCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center pt-6',
        // Responsive layout
        'flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2',
        className
      )}
      {...props}
    />
  )
)

ResponsiveCardFooter.displayName = 'ResponsiveCardFooter'

export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
  ResponsiveCardFooter,
}