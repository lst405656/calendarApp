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
  Legend,
  ResponsiveContainer
} from 'recharts'

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

export function DashboardPage() {
  const [stats, setStats] = useState<MonthlyStats>({
    totalIncome: 0,
    totalExpense: 0,
    incomeChange: 0,
    expenseChange: 0,
    eventCount: 0,
    todayEventCount: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()

      // Get monthly statistics
      const monthlyStats = await window.api.getMonthlyStats(year, month)
      setStats(monthlyStats)

      // Get daily transactions for chart
      const dailyData = await window.api.getDailyTransactions(year, month)

      // Transform data for chart
      const dataMap = new Map<string, { date: string; income: number; expense: number }>()

      dailyData.forEach((item) => {
        const day = parseInt(item.date.split('-')[2])
        const key = `${day}일`

        if (!dataMap.has(key)) {
          dataMap.set(key, { date: key, income: 0, expense: 0 })
        }

        const entry = dataMap.get(key)!
        if (item.type === 'income') {
          entry.income = item.total
        } else {
          entry.expense = item.total
        }
      })

      const chartArray = Array.from(dataMap.values()).sort((a, b) => {
        const dayA = parseInt(a.date)
        const dayB = parseInt(b.date)
        return dayA - dayB
      })

      setChartData(chartArray)

      // Get recent transactions
      const recent = await window.api.getRecentTransactions(5)
      setRecentTransactions(recent)
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>일별 수입/지출</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="수입" />
                  <Bar dataKey="expense" fill="#ef4444" name="지출" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
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
