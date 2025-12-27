import * as React from 'react';
import { cn } from '@/libs/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-sys-bg-surface border border-sys-border-hairline',
      outline: 'border border-sys-border-hairline',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center text-caption text-sys-text-secondary uppercase tracking-wider rounded-xs',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge

