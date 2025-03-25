import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

type DateTimeDisplayProps = {
  value: string | Date | null | undefined
  withTime?: boolean
  className?: string
}

export default function DateTimeDisplay({ value, withTime = true, className = '' }: DateTimeDisplayProps) {
  if (!value) return <span className={className}>--</span>

  const date = typeof value === 'string' ? new Date(value) : value

  const formatted = format(date, withTime ? 'HH:mm dd/MM/yyyy' : 'dd/MM/yyyy', { locale: vi })

  return <span className={className}>{formatted}</span>
}
