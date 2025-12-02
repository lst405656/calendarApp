import * as React from "react"
import { cn } from "../../lib/utils"

export interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { }

const Anchor = React.forwardRef<HTMLAnchorElement, AnchorProps>(
    ({ className, ...props }, ref) => {
        return (
            <a
                ref={ref}
                className={cn(className)}
                {...props}
            />
        )
    }
)
Anchor.displayName = "Anchor"

export { Anchor }
