import * as React from "react"
import { cn } from "../../lib/utils"

export interface DivProps extends React.HTMLAttributes<HTMLDivElement> { }

const Div = React.forwardRef<HTMLDivElement, DivProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(className)}
                {...props}
            />
        )
    }
)
Div.displayName = "Div"

export { Div }
