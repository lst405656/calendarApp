import { useState, useEffect } from 'react'
import { Button } from '../components/base/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/composite/tabs'
import { MonthGrid } from '../components/composite/month-grid'
import { DateDetailsSidebar } from '../components/composite/date-details-sidebar'
import { EventFormDialog } from '../components/composite/event-form-dialog'
import { TransactionFormDialog } from '../components/composite/transaction-form-dialog'
import { getMonthName, getLocalDateString, extractDatePart } from '../lib/date-utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthPicker } from '../components/composite/month-picker'
import { fetchHolidayMap } from '../lib/holiday-api'

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(400)
  const [isResizing, setIsResizing] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [holidayCache, setHolidayCache] = useState<Record<number, Record<string, string>>>({})

  // Dialog states
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>()
  const [editingTransaction, setEditingTransaction] = useState<any>()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    fetchData()
  }, [currentDate])

  useEffect(() => {
    let cancelled = false
    if (holidayCache[year]) {
      return
    }

    const controller = new AbortController()

    const loadHolidays = async () => {
      try {
        const map = await fetchHolidayMap(year, controller.signal)
        if (cancelled) return
        setHolidayCache((prev) => ({
          ...prev,
          [year]: map
        }))
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Failed to fetch holiday data:', error)
      }
    }

    loadHolidays()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [year, holidayCache])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const fetchData = async () => {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const evs = await window.api.getEvents(startDate, endDate)
      const trs = await window.api.getTransactions(startDate, endDate)

      setEvents(evs)
      setTransactions(trs)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    setSidebarOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSidebarOpen(true)
  }

  // Event handlers
  const handleAddEvent = () => {
    setEditingEvent(undefined)
    setEventDialogOpen(true)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setEventDialogOpen(true)
  }

  const handleDeleteEvent = async (id: number) => {
    if (confirm('이 일정를 삭제하시겠습니까?')) {
      try {
        await window.api.deleteEvent(id)
        fetchData()
      } catch (error) {
        console.error('Failed to delete event:', error)
        alert('일정 삭제에 실패했습니다.')
      }
    }
  }

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (editingEvent) {
        await window.api.updateEvent(editingEvent.id, eventData)
      } else {
        await window.api.addEvent(eventData)
      }
      fetchData()
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('일정 저장에 실패했습니다.')
    }
  }

  // Transaction handlers
  const handleAddIncome = () => {
    setEditingTransaction(undefined)
    setTransactionDialogOpen(true)
  }

  const handleAddExpense = () => {
    setEditingTransaction(undefined)
    setTransactionDialogOpen(true)
  }

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction)
    setTransactionDialogOpen(true)
  }

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('이 거래를 삭제하시겠습니까?')) {
      try {
        await window.api.deleteTransaction(id)
        fetchData()
      } catch (error) {
        console.error('Failed to delete transaction:', error)
        alert('거래 삭제에 실패했습니다.')
      }
    }
  }

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      if (editingTransaction) {
        await window.api.updateTransaction(editingTransaction.id, transactionData)
      } else {
        await window.api.addTransaction(transactionData)
      }
      fetchData()
    } catch (error) {
      console.error('Failed to save transaction:', error)
      alert('거래 저장에 실패했습니다.')
    }
  }

  const addTestData = async () => {
    try {
      const today = new Date()
      const dateStr = getLocalDateString(today)

      await window.api.addEvent({
        title: '테스트 일정',
        start_date: dateStr,
        end_date: dateStr,
        description: '오늘의 테스트 일정입니다',
        color: '#3b82f6'
      })

      await window.api.addTransaction({
        date: dateStr,
        amount: 50000,
        type: 'expense',
        category: '식비',
        description: '테스트 점심'
      })

      fetchData()
      alert('오늘 날짜에 테스트 데이터가 추가되었습니다!')
    } catch (error) {
      console.error('Failed to add test data:', error)
    }
  }

  const getSelectedDateData = () => {
    if (!selectedDate) return { events: [], transactions: [] }

    const dateStr = getLocalDateString(selectedDate)
    return {
      events: events.filter((e) => extractDatePart(e.start_date) === dateStr),
      transactions: transactions.filter((t) => extractDatePart(t.date) === dateStr)
    }
  }

  const { events: selectedEvents, transactions: selectedTransactions } = getSelectedDateData()

  return (
    <div className="p-8 h-full overflow-hidden flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">캘린더</h2>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 relative">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-700 min-w-[160px] hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            >
              {year}년 {getMonthName(month)}
            </button>

            {isPickerOpen && (
              <MonthPicker
                currentDate={currentDate}
                onSelect={(date) => {
                  setCurrentDate(date)
                  setIsPickerOpen(false)
                }}
                onClose={() => setIsPickerOpen(false)}
              />
            )}

            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToToday}>
            오늘
          </Button>
          <Button variant="outline" onClick={addTestData}>
            테스트 데이터 추가
          </Button>
          <Button onClick={handleAddEvent}>새 일정 추가</Button>
        </div>
      </header>

      <Tabs
        defaultValue="month"
        value={view}
        onValueChange={(v) => setView(v as any)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="month">월</TabsTrigger>
          <TabsTrigger value="week">주</TabsTrigger>
          <TabsTrigger value="day">일</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="flex-1 overflow-hidden">
          <div className="flex gap-6 h-full relative">
            <div className="flex-1 overflow-auto">
              <MonthGrid
                year={year}
                month={month}
                events={events}
                transactions={transactions}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
                holidays={holidayCache[year] ?? {}}
              />
            </div>

            {sidebarOpen && selectedDate && (
              <>
                <div
                  className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize transition-colors"
                  onMouseDown={() => setIsResizing(true)}
                />
                <div style={{ width: `${sidebarWidth}px` }} className="overflow-auto">
                  <DateDetailsSidebar
                    date={selectedDate}
                    events={selectedEvents}
                    transactions={selectedTransactions}
                    onAddEvent={handleAddEvent}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onAddIncome={handleAddIncome}
                    onAddExpense={handleAddExpense}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                </div>
              </>
            )}

            {!sidebarOpen && (
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={() => setSidebarOpen(true)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            {sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="week">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex items-center justify-center text-gray-400">
            주간 뷰 - 준비 중
          </div>
        </TabsContent>

        <TabsContent value="day">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex items-center justify-center text-gray-400">
            일간 뷰 - 준비 중
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Form Dialog */}
      <EventFormDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={editingEvent}
        defaultDate={selectedDate ? getLocalDateString(selectedDate) : undefined}
        onSave={handleSaveEvent}
      />

      {/* Transaction Form Dialog */}
      <TransactionFormDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        transaction={editingTransaction}
        defaultDate={selectedDate ? getLocalDateString(selectedDate) : undefined}
        onSave={handleSaveTransaction}
      />
    </div>
  )
}
