import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../base/button'
import { cn } from '../../lib/utils'

interface MonthPickerProps {
    currentDate: Date
    onSelect: (date: Date) => void
    onClose: () => void
}

export function MonthPicker({ currentDate, onSelect, onClose }: MonthPickerProps) {
    const [year, setYear] = useState(currentDate.getFullYear())
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

    const handlePrevYear = () => setYear(year - 1)
    const handleNextYear = () => setYear(year + 1)

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(year, monthIndex, 1)
        onSelect(newDate)
        onClose()
    }

    const months = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ]

    return (
        <div
            ref={pickerRef}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-[280px]"
        >
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={handlePrevYear}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-bold text-gray-800">{year}년</span>
                <Button variant="ghost" size="icon" onClick={handleNextYear}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                    <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={cn(
                            "p-2 rounded-md text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600",
                            year === currentDate.getFullYear() && index === currentDate.getMonth()
                                ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                : "text-gray-700 bg-gray-50"
                        )}
                    >
                        {month}
                    </button>
                ))}
            </div>
        </div>
    )
}
