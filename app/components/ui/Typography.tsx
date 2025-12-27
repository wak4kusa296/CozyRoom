import React from 'react'
import { cn } from '@/libs/utils'

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  variant?: 'display-lg' | 'display-md' | 'heading-lg' | 'heading-md' | 'body-lg' | 'body-md' | 'caption';
  color?: 'primary' | 'secondary' | 'disabled'
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ as, variant = 'body-md', color = 'primary', className, children, ...props }, ref) => {
    const Component = as || (variant.startsWith('display') || variant.startsWith('heading') ? 'h1' : 'p')
    
    const variants = {
      'display-lg': 'text-display-lg font-bold',
      'display-md': 'text-display-md font-bold',
      'heading-lg': 'text-heading-lg font-bold',
      'heading-md': 'text-heading-md font-bold',
      'body-lg': 'text-body-lg',
      'body-md': 'text-body-md',
      'caption': 'text-caption',
    }
    
    const colors = {
      primary: 'text-sys-text-primary',
      secondary: 'text-sys-text-secondary',
      disabled: 'text-sys-text-disabled',
    }

    return (
      <Component
        ref={ref as any}
        className={cn(variants[variant], colors[color], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Typography.displayName = 'Typography'

export default Typography

