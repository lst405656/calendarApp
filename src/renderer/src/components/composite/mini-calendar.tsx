import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../base/button'
import { cn } from '../../lib/utils'
import { getDaysInMonth, getFirstDayOfMonth } from '../../lib/date-utils'

interface MiniCalendarProps {
    currentDate: Date
    onSelect: (date: Date) => void
    onClose: () => void
}

export function MiniCalendar({ currentDate, onSelect, onClose }: MiniCalendarProps) {
    const [displayDate, setDisplayDate] = useState(new Date(currentDate))
    const pickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [onClose])

    const year = displayDate.getFullYear()
    const month = displayDate.getMonth()

    const handlePrevMonth = () => {
        setDisplayDate(new Date(year, month - 1, 1))
    }

    const handleNextMonth = () => {
        setDisplayDate(new Date(year, month + 1, 1))
    }

    const handleDateSelect = (day: number) => {
        const newDate = new Date(year, month, day)
        onSelect(newDate)
        onClose()
    }

    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    // Generate calendar grid
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    return (
        <div
            ref={pickerRef}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-[300px]"
        >
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-base font-bold text-gray-800">
                    {year}년 {month + 1}월
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (day === null) return <div key={`empty-${index}`} />

                    const isSelected =
                        day === currentDate.getDate() &&
                        month === currentDate.getMonth() &&
                        year === currentDate.getFullYear()

                    const isToday =
                        day === new Date().getDate() &&
                        month === new Date().getMonth() &&
                        year === new Date().getFullYear()

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateSelect(day)}
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 mx-auto",
                                isSelected
                                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                    : isToday
                                        ? "text-blue-600 font-bold bg-blue-50"
                                        : "text-gray-700"
                            )}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
