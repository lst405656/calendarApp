import * as React from "react"
import { cn } from "../../lib/utils"

export interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> { }

const Span = React.forwardRef<HTMLSpanElement, SpanProps>(
    ({ className, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(className)}
                {...props}
            />
        )
    }
)
Span.displayName = "Span"

export { Span }
