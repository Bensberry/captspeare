'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

// Temporary stub component until react-day-picker is installed
function Calendar({ className, ...props }: any) {
  return (
    <div className={cn('p-3 text-center text-muted-foreground', className)}>
      Calendar component temporarily disabled
    </div>
  )
}

function CalendarDayButton({ ...props }: any) {
  return <Button {...props} />
}

export { Calendar, CalendarDayButton }
