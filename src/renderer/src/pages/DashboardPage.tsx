import { Card, CardContent, CardHeader, CardTitle } from '../components/composite/card'
import { Activity, CreditCard, Calendar as CalendarIcon, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/composite/tabs'

interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  incomeChange: number
  expenseChange: number
  eventCount: number
  todayEventCount: number
}

interface Transaction {
  id: number
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description?: string
}

interface Event {
  id: number
  title: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  description?: string
  color?: string
}

interface CategoryStat {
  category: string
  type: 'income' | 'expense'
  total: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<MonthlyStats>({
    totalIncome: 0,
    totalExpense: 0,
    incomeChange: 0,
    expenseChange: 0,
    eventCount: 0,
    todayEventCount: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [todayEvents, setTodayEvents] = useState<Event[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weeklyCategoryStats, setWeeklyCategoryStats] = useState<{
    income: CategoryStat[]
    expense: CategoryStat[]
  }>({ income: [], expense: [] })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()

      // Get monthly statistics
      const monthlyStats = await window.api.getMonthlyStats(year, month)
      setStats(monthlyStats)

      // Get weekly category stats
      const categoryStats = await window.api.getWeeklyCategoryStats()
      const income = categoryStats.filter((c) => c.type === 'income')
      const expense = categoryStats.filter((c) => c.type === 'expense')
      setWeeklyCategoryStats({ income, expense })

      // Get recent transactions
      const recent = await window.api.getRecentTransactions(5)
      setRecentTransactions(recent)

      // Get today events
      const events = await window.api.getTodayEvents()
      setTodayEvents(events)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const isEventActive = (event: Event) => {
    if (!event.start_time) return false

    const now = currentTime
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const [startH, startM] = event.start_time.split(':').map(Number)
    const startMinutes = startH * 60 + startM

    if (event.end_time) {
      const [endH, endM] = event.end_time.split(':').map(Number)
      const endMinutes = endH * 60 + endM
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes
    } else {
      // If no end time, consider active for 1 hour or just check if it's within start time and now
      // Let's active if it started within last 30 mins
      return currentMinutes >= startMinutes && currentMinutes < startMinutes + 60
    }
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">대시보드</h2>
        <p className="text-gray-500">이번 달 활동 요약입니다.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지출 (이번 달)</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpense)}</div>
            <p
              className={`text-xs ${stats.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              지난 달 대비 {formatPercentage(stats.expenseChange)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수입 (이번 달)</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalIncome)}</div>
            <p className={`text-xs ${stats.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              지난 달 대비 {formatPercentage(stats.incomeChange)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예정된 일정</CardTitle>
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventCount}</div>
            <p className="text-xs text-gray-500">오늘 일정 {stats.todayEventCount}개</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">순 자산 변화</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalIncome - stats.totalExpense)}
            </div>
            <p className="text-xs text-gray-500">이번 달 수입 - 지출</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
        <Card className="col-span-4 h-full flex flex-col">
          <CardHeader>
            <CardTitle>최근 1주일 카테고리별 현황</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <Tabs defaultValue="expense" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="income">수입</TabsTrigger>
                <TabsTrigger value="expense">지출</TabsTrigger>
              </TabsList>
              <TabsContent value="income" className="flex-1 min-h-[250px]">
                {weeklyCategoryStats.income.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyCategoryStats.income} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="total" fill="#10b981" name="금액" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-400">
                    데이터가 없습니다
                  </div>
                )}
              </TabsContent>
              <TabsContent value="expense" className="flex-1 min-h-[250px]">
                {weeklyCategoryStats.expense.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyCategoryStats.expense} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="total" fill="#ef4444" name="금액" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-400">
                    데이터가 없습니다
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Today's Schedule Timeline */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>오늘의 일정</span>
              <span className="text-sm font-normal text-gray-500">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 py-2">
                {todayEvents.map((event) => {
                  const isActive = isEventActive(event)
                  return (
                    <div key={event.id} className="relative pl-6">
                      <span
                        className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-white transition-colors ${isActive ? 'border-red-500 bg-red-50 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : 'border-gray-300'
                          }`}
                        style={{ borderColor: isActive ? undefined : event.color }}
                      />
                      <div className={`transition-all ${isActive ? 'scale-105 origin-left' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-semibold ${isActive ? 'text-red-600' : 'text-gray-500'
                              }`}
                          >
                            {event.start_time || '하루 종일'}
                            {event.end_time && ` - ${event.end_time}`}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full animate-pulse">
                              진행 중
                            </span>
                          )}
                        </div>
                        <h4 className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 gap-2">
                <CalendarIcon className="w-10 h-10 opacity-20" />
                <p>오늘 등록된 일정이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>최근 거래 내역</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{transaction.category}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.description || '설명 없음'}
                      </p>
                      <p className="text-xs text-gray-400">{transaction.date}</p>
                    </div>
                    <div
                      className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                거래 내역이 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
