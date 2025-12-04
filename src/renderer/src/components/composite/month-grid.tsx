import { useMemo } from 'react'
import { cn } from '../../lib/utils'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getDayName,
  formatCurrency,
  extractDatePart
} from '../../lib/date-utils'
import { Div } from '../base/div'
import { Typography } from '../base/typography'

interface CalendarEvent {
  id: number
  title: string
  start_date: string
  end_date: string
  description?: string
  color?: string
}

interface Transaction {
  id: number
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description?: string
}

interface MonthGridProps {
  year: number
  month: number
  events: CalendarEvent[]
  transactions: Transaction[]
  selectedDate?: Date
  onDateClick?: (date: Date) => void
}

export function MonthGrid({
  year,
  month,
  events,
  transactions,
  selectedDate,
  onDateClick
}: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const weeks = useMemo(() => {
    const weeks: (number | null)[][] = []
    let currentWeek: (number | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      currentWeek.push(i)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    // Fill the last week with nulls if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [daysInMonth, firstDay])

  // Calculate event layout for each week
  const getWeekEvents = (week: (number | null)[]) => {
    // 1. Get all events that overlap with this week
    // Calculate actual date range for the week (handling nulls correctly)
    // We need to know the exact date for each cell to check overlap
    const weekDates = week.map((day) => {
      if (day === null) return null
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    })

    const weekEvents = events.filter((e) => {
      const start = extractDatePart(e.start_date)
      const end = extractDatePart(e.end_date)

      // Check if event overlaps with any date in this week
      return weekDates.some((date) => date && date >= start && date <= end)
    })

    // 2. Sort events: longer duration first, then earlier start date
    weekEvents.sort((a, b) => {
      const aStart = extractDatePart(a.start_date)
      const bStart = extractDatePart(b.start_date)
      const aEnd = extractDatePart(a.end_date)
      const bEnd = extractDatePart(b.end_date)

      // Calculate duration (rough approximation is fine for sorting)
      const aDuration = new Date(aEnd).getTime() - new Date(aStart).getTime()
      const bDuration = new Date(bEnd).getTime() - new Date(bStart).getTime()

      if (aDuration !== bDuration) return bDuration - aDuration // Longer first
      return aStart.localeCompare(bStart) // Earlier start first
    })

    // 3. Assign rows
    const eventRows: { [key: number]: number } = {} // eventId -> rowIndex
    const rowOccupancy: { [key: number]: string[] } = {} // rowIndex -> array of occupied dates

    weekEvents.forEach((event) => {
      const start = extractDatePart(event.start_date)
      const end = extractDatePart(event.end_date)

      let rowIndex = 0
      while (true) {
        // Check if this row is free for the event's duration IN THIS WEEK
        const isRowFree = weekDates.every((date) => {
          if (!date) return true // Null day is always free
          if (date < start || date > end) return true // Date outside event is free

          // Check if this date in this row is already occupied
          return !rowOccupancy[rowIndex]?.includes(date)
        })

        if (isRowFree) {
          eventRows[event.id] = rowIndex
          if (!rowOccupancy[rowIndex]) rowOccupancy[rowIndex] = []

          // Mark dates as occupied
          weekDates.forEach((date) => {
            if (date && date >= start && date <= end) {
              rowOccupancy[rowIndex].push(date)
            }
          })
          break
        }
        rowIndex++
      }
    })

    return { weekEvents, eventRows }
  }

  const getTransactionsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return transactions.filter((t) => extractDatePart(t.date) === dateStr)
  }

  const getTotalsByDate = (day: number) => {
    const dayTransactions = getTransactionsForDate(day)
    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return { income, expense }
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  return (
    <Div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">
      {/* Header with day names */}
      <Div className="grid grid-cols-7 border-b border-gray-200 flex-none">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <Div key={day} className="p-3 text-center border-r border-gray-100 last:border-r-0">
            <Typography as="span" className="text-sm font-semibold text-gray-600">
              {getDayName(day)}
            </Typography>
          </Div>
        ))}
      </Div>

      {/* Calendar grid */}
      <Div className="flex-1 flex flex-col">
        {weeks.map((week, weekIndex) => {
          const { weekEvents, eventRows } = getWeekEvents(week)
          // Determine max row index for this week to set min height or consistent layout
          const maxRow = Math.max(-1, ...Object.values(eventRows))

          return (
            <Div
              key={weekIndex}
              className="grid grid-cols-7 flex-1 border-b border-gray-100 last:border-b-0 min-h-[120px]"
            >
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return (
                    <Div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="border-r border-gray-100 bg-gray-50 last:border-r-0"
                    />
                  )
                }

                const { income, expense } = getTotalsByDate(day)
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const selected = isSelected(day)
                const today = isToday(day)

                // Prepare events for this day based on calculated rows
                const eventsToRender: (CalendarEvent | null)[] = []
                // We need to render up to maxRow + 1 slots
                // But we limit to show max 4 items to avoid overflow, or use scroll?
                // Let's try to render what we have, and maybe limit visual height

                for (let i = 0; i <= maxRow; i++) {
                  const eventForRow = weekEvents.find((e) => {
                    if (eventRows[e.id] !== i) return false
                    const start = extractDatePart(e.start_date)
                    const end = extractDatePart(e.end_date)
                    return dateStr >= start && dateStr <= end
                  })
                  eventsToRender[i] = eventForRow ?? null
                }

                return (
                  <Div
                    key={day}
                    onClick={() => onDateClick?.(new Date(year, month, day))}
                    className={cn(
                      'border-r border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 flex flex-col last:border-r-0 relative group',
                      selected && 'bg-blue-50'
                    )}
                  >
                    {/* Date Header & Financial Summary */}
                    <Div className="flex items-start justify-between px-2 pt-2 mb-1 h-[28px]">
                      <Typography
                        as="div"
                        className={cn(
                          'text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                          today && 'bg-blue-600 text-white',
                          !today && 'text-gray-700',
                          selected && !today && 'bg-blue-200 text-blue-800'
                        )}
                      >
                        {day}
                      </Typography>

                      <Div className="flex flex-col items-end text-[10px] leading-tight">
                        {income > 0 && (
                          <span className="text-green-600 font-medium">
                            +{formatCurrency(income)}
                          </span>
                        )}
                        {expense > 0 && (
                          <span className="text-red-600 font-medium">
                            -{formatCurrency(expense)}
                          </span>
                        )}
                      </Div>
                    </Div>

                    {/* Events Area */}
                    <Div className="flex-1 flex flex-col gap-[1px] w-full relative">
                      {eventsToRender.map((event, index) => {
                        if (!event) {
                          return <Div key={`empty-${index}`} className="h-5" /> // Empty slot placeholder
                        }

                        const start = extractDatePart(event.start_date)
                        const end = extractDatePart(event.end_date)
                        const isStart = dateStr === start
                        const isEnd = dateStr === end
                        const isWeekStart = dayIndex === 0
                        const isWeekEnd = dayIndex === 6

                        // Visual start/end logic considering week boundaries
                        const visualStart = isStart || isWeekStart
                        const visualEnd = isEnd || isWeekEnd

                        return (
                          <Div
                            key={event.id}
                            className={cn(
                              'text-xs h-5 flex items-center px-1 truncate absolute w-[calc(100%+1px)]' // Absolute positioning trick? No, let's stick to flow but negative margins
                              // Actually, standard flow with negative margins is better for layout
                            )}
                            style={{
                              position: 'absolute',
                              top: `${index * 21}px`, // Fixed height positioning
                              left: isStart || isWeekStart ? '2px' : '-1px',
                              right: isEnd || isWeekEnd ? '2px' : '-1px',
                              height: '20px',
                              backgroundColor: event.color || '#3b82f6',
                              color: 'white',
                              opacity: dateStr > start && dateStr < end ? 0.9 : 1,
                              zIndex: 10,
                              borderRadius: `${visualStart ? '4px' : '0'} ${visualEnd ? '4px' : '0'} ${visualEnd ? '4px' : '0'} ${visualStart ? '4px' : '0'}`
                            }}
                          >
                            {(isStart || isWeekStart) && (
                              <span className="truncate w-full pl-1">{event.title}</span>
                            )}
                          </Div>
                        )
                      })}
                    </Div>
                  </Div>
                )
              })}
            </Div>
          )
        })}
      </Div>
    </Div>
  )
}
