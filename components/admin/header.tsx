import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  heading: string
  text?: string
  description?: string
  children?: React.ReactNode
}

export function AdminHeader({
  heading,
  text,
  description,
  children,
}: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {text && (
          <p className="text-lg text-muted-foreground">{text}</p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
