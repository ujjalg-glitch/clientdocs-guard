import { cn } from '@/lib/utils'

interface AdminShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminShell({ className, ...props }: AdminShellProps) {
  return (
    <div className={cn('container py-6', className)} {...props} />
  )
}
