import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface IconProps extends React.SVGAttributes<SVGElement> {
  icon: LucideIcon
  size?: number | string
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 16, className, ...props }, ref) => {
    return <IconComponent ref={ref} size={size} className={cn(className)} {...props} />
  }
)
Icon.displayName = 'Icon'

export { Icon }
