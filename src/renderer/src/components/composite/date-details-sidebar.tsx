import { Div } from '../base/div'
import { Typography } from '../base/typography'
import { Button } from '../base/button'
import { Badge } from './badge'
import { formatCurrency } from '../../lib/date-utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useCategories } from '../../hooks/use-categories'

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

interface DateDetailsSidebarProps {
  date: Date
  events: CalendarEvent[]
  transactions: Transaction[]
  onAddEvent?: () => void
  onEditEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (id: number) => void
  onAddIncome?: () => void
  onAddExpense?: () => void
  onEditTransaction?: (transaction: Transaction) => void
  onDeleteTransaction?: (id: number) => void
}

export function DateDetailsSidebar({
  date,
  events,
  transactions,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onAddIncome,
  onAddExpense,
  onEditTransaction,
  onDeleteTransaction
}: DateDetailsSidebarProps) {
  const { getCategoryColor } = useCategories()
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const dateStr = date.toLocaleDateString('ko-KR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Div className="bg-white rounded-xl border border-gray-200 p-6">
      <Typography as="h3" className="text-lg font-bold text-gray-800 mb-4">
        {dateStr} 상세
      </Typography>

      {/* Income/Expense Summary */}
      <Div className="grid grid-cols-2 gap-4 mb-6">
        <Div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <Typography as="div" className="text-sm text-green-700 mb-1">
            수입
          </Typography>
          <Typography as="div" className="text-xl font-bold text-green-600">
            {formatCurrency(income)}
          </Typography>
        </Div>
        <Div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <Typography as="div" className="text-sm text-red-700 mb-1">
            지출
          </Typography>
          <Typography as="div" className="text-xl font-bold text-red-600">
            {formatCurrency(expense)}
          </Typography>
        </Div>
      </Div>

      {/* Events Section */}
      <Div className="mb-6">
        <Div className="flex items-center justify-between mb-3">
          <Typography as="h4" className="font-semibold text-gray-800">
            일정
          </Typography>
          <Button size="sm" onClick={onAddEvent}>
            <Plus className="w-4 h-4 mr-1" />
            추가
          </Button>
        </Div>
        {events.length === 0 ? (
          <Typography as="p" className="text-sm text-gray-500 italic">
            일정 없음
          </Typography>
        ) : (
          <Div className="space-y-2">
            {events.map((event) => (
              <Div
                key={event.id}
                className="p-3 rounded-lg border-l-4 bg-gray-50 group hover:bg-gray-100 transition-colors"
                style={{ borderLeftColor: event.color || '#3b82f6' }}
              >
                <Div className="flex items-start justify-between">
                  <Div className="flex-1">
                    <Typography as="div" className="font-semibold text-gray-800 mb-1">
                      {event.title}
                    </Typography>
                    {event.description && (
                      <Typography as="p" className="text-sm text-gray-600 mb-1">
                        {event.description}
                      </Typography>
                    )}
                  </Div>
                  <Div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditEvent && (
                      <Button size="sm" variant="ghost" onClick={() => onEditEvent(event)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    {onDeleteEvent && (
                      <Button size="sm" variant="ghost" onClick={() => onDeleteEvent(event.id)}>
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    )}
                  </Div>
                </Div>
              </Div>
            ))}
          </Div>
        )}
      </Div>

      {/* Transactions Section */}
      <Div>
        <Div className="flex items-center justify-between mb-3">
          <Typography as="h4" className="font-semibold text-gray-800">
            거래
          </Typography>
          <Div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onAddIncome}>
              <Plus className="w-4 h-4 mr-1" />
              수입
            </Button>
            <Button size="sm" variant="outline" onClick={onAddExpense}>
              <Plus className="w-4 h-4 mr-1" />
              지출
            </Button>
          </Div>
        </Div>
        {transactions.length === 0 ? (
          <Typography as="p" className="text-sm text-gray-500 italic">
            거래 내역 없음
          </Typography>
        ) : (
          <Div className="space-y-2">
            {transactions.map((transaction) => (
              <Div
                key={transaction.id}
                className="p-3 rounded-lg bg-gray-50 group hover:bg-gray-100 transition-colors"
              >
                <Div className="flex items-start justify-between">
                  <Div className="flex-1">
                    <Div className="flex items-center gap-2 mb-1">
                      <Div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getCategoryColor(transaction.category) }}
                        />
                        <Typography as="span" className="font-semibold text-gray-800">
                          {transaction.category}
                        </Typography>
                      </Div>
                      <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                        {transaction.type === 'income' ? '수입' : '지출'}
                      </Badge>
                    </Div>
                    {transaction.description && (
                      <Typography as="p" className="text-sm text-gray-600 mb-1">
                        {transaction.description}
                      </Typography>
                    )}
                    <Typography
                      as="div"
                      className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </Div>
                  <Div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditTransaction && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditTransaction(transaction)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    {onDeleteTransaction && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    )}
                  </Div>
                </Div>
              </Div>
            ))}
          </Div>
        )}
      </Div>
    </Div>
  )
}
