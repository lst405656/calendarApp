import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, alt, ...props }, ref) => {
    return (
      <img ref={ref} alt={alt} className={cn('block max-w-full h-auto', className)} {...props} />
    )
  }
)
Image.displayName = 'Image'

export { Image }
