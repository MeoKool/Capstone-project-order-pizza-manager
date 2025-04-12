import { Card, CardContent } from '@/components/ui/card'
import type React from 'react'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  className?: string
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card className={`border-2 ${className}`}>
      <CardContent className='p-4 flex justify-between items-center'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='text-2xl font-bold'>{value}</p>
        </div>
        <div className='rounded-full p-2 bg-white shadow-sm'>{icon}</div>
      </CardContent>
    </Card>
  )
}
