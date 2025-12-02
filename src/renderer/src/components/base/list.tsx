import * as React from "react"
import { cn } from "../../lib/utils"

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> { }

const List = React.forwardRef<HTMLUListElement, ListProps>(
    ({ className, ...props }, ref) => {
        return (
            <ul
                ref={ref}
                className={cn(className)}
                {...props}
            />
        )
    }
)
List.displayName = "List"

export { List }
