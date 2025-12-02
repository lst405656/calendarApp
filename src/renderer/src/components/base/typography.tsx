import * as React from "react"
import { cn } from "../../lib/utils"

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label"
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, as: Component = "p", ...props }, ref) => {
        return (
            <Component
                className={cn(className)}
                ref={ref as any}
                {...props}
            />
        )
    }
)
Typography.displayName = "Typography"

export { Typography }
