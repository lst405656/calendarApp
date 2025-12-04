import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn(className)} {...props} />
})
ListItem.displayName = 'ListItem'

export { ListItem }
