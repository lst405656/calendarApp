import { useState, useEffect } from 'react'
import { Button } from "../components/base/button"
import { Input } from "../components/base/input"
import { Select } from "../components/base/select"
import { Card, CardContent } from "../components/composite/card"
import { Badge } from "../components/composite/badge"
import { TransactionFormDialog } from "../components/composite/transaction-form-dialog"
import { formatCurrency, getDaysInMonth } from "../lib/date-utils"
import { Plus, Search, TrendingUp, TrendingDown, Wallet, Edit, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { MonthPicker } from "../components/composite/month-picker"
import { MiniCalendar } from "../components/composite/mini-calendar"
import { useCategories } from "../hooks/use-categories"

interface Transaction {
    id: number
    date: string
    amount: number
    type: 'income' | 'expense'
    category: string
    description?: string
}

export function LedgerPage() {
    const { getCategoryColor } = useCategories()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month')
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    useEffect(() => {
        fetchTransactions()
    }, [currentDate, viewMode])

    const fetchTransactions = async () => {
        try {
            let startDate = ''
            let endDate = ''

            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const day = currentDate.getDate()

            if (viewMode === 'day') {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                startDate = dateStr
                endDate = dateStr
            } else if (viewMode === 'week') {
                const dayOfWeek = currentDate.getDay() // 0 (Sun) - 6 (Sat)
                const start = new Date(currentDate)
                start.setDate(day - dayOfWeek) // Sunday
                const end = new Date(currentDate)
                end.setDate(day + (6 - dayOfWeek)) // Saturday

                startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
                endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
            } else {
                // Month
                startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
                const lastDay = getDaysInMonth(year, month)
                endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
            }

            const trs = await window.api.getTransactions(startDate, endDate)
            setTransactions(trs)
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
        }
    }

    const handlePrev = () => {
        const newDate = new Date(currentDate)
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() - 1)
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7)
        } else {
            newDate.setMonth(newDate.getMonth() - 1)
            newDate.setDate(1)
        }
        setCurrentDate(newDate)
    }

    const handleNext = () => {
        const newDate = new Date(currentDate)
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + 1)
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7)
        } else {
            newDate.setMonth(newDate.getMonth() + 1)
            newDate.setDate(1)
        }
        setCurrentDate(newDate)
    }

    const handleAddTransaction = () => {
        setEditingTransaction(undefined)
        setDialogOpen(true)
    }

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setDialogOpen(true)
    }

    const handleDeleteTransaction = async (id: number) => {
        if (confirm('이 거래를 삭제하시겠습니까?')) {
            try {
                await window.api.deleteTransaction(id)
                fetchTransactions()
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
            fetchTransactions()
        } catch (error) {
            console.error('Failed to save transaction:', error)
            alert('거래 저장에 실패했습니다.')
        }
    }

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || t.type === filterType
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory

        return matchesSearch && matchesType && matchesCategory
    })

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpense

    const categories = Array.from(new Set(transactions.map(t => t.category)))

    const getDateRangeString = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const day = currentDate.getDate()

        if (viewMode === 'day') {
            return `${year}년 ${month}월 ${day}일`
        } else if (viewMode === 'week') {
            const dayOfWeek = currentDate.getDay()
            const start = new Date(currentDate)
            start.setDate(day - dayOfWeek)
            const end = new Date(currentDate)
            end.setDate(day + (6 - dayOfWeek))

            // 같은 달이면 "5월 1일 - 7일", 다른 달이면 "4월 28일 - 5월 4일"
            if (start.getMonth() === end.getMonth()) {
                return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getDate()}일`
            } else {
                return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`
            }
        } else {
            return `${year}년 ${month}월`
        }
    }

    const currentRangeString = getDateRangeString()

    return (
        <div className="p-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">가계부</h2>

                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <Button
                            variant={viewMode === 'day' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('day')}
                            className={viewMode === 'day' ? 'shadow-sm' : ''}
                        >
                            일간
                        </Button>
                        <Button
                            variant={viewMode === 'week' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('week')}
                            className={viewMode === 'week' ? 'shadow-sm' : ''}
                        >
                            주간
                        </Button>
                        <Button
                            variant={viewMode === 'month' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('month')}
                            className={viewMode === 'month' ? 'shadow-sm' : ''}
                        >
                            월간
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 relative">
                        <Button variant="ghost" size="icon" onClick={handlePrev}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <button
                            onClick={() => setIsPickerOpen(!isPickerOpen)}
                            className="flex items-center justify-center gap-2 text-sm font-semibold min-w-[160px] hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                        >
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {currentRangeString}
                        </button>

                        {isPickerOpen && (
                            viewMode === 'month' ? (
                                <MonthPicker
                                    currentDate={currentDate}
                                    onSelect={(date) => {
                                        setCurrentDate(date)
                                        setIsPickerOpen(false)
                                    }}
                                    onClose={() => setIsPickerOpen(false)}
                                />
                            ) : (
                                <MiniCalendar
                                    currentDate={currentDate}
                                    onSelect={(date) => {
                                        if (viewMode === 'week') {
                                            const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)
                                            const startOfWeek = new Date(date);
                                            startOfWeek.setDate(date.getDate() - dayOfWeek);
                                            setCurrentDate(startOfWeek);
                                        } else {
                                            setCurrentDate(date);
                                        }
                                        setIsPickerOpen(false);
                                    }}
                                    onClose={() => setIsPickerOpen(false)}
                                />
                            )
                        )}

                        <Button variant="ghost" size="icon" onClick={handleNext}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <Button onClick={handleAddTransaction}>
                    <Plus className="w-4 h-4 mr-2" />
                    거래 추가
                </Button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-500">총 수입</div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                        <div className="text-xs text-gray-500 mt-1">{currentRangeString}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-500">총 지출</div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                        <div className="text-xs text-gray-500 mt-1">{currentRangeString}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-500">잔액</div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Wallet className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(balance)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">순 흐름</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="거래 검색..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
                            <option value="all">모든 유형</option>
                            <option value="income">수입</option>
                            <option value="expense">지출</option>
                        </Select>
                        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="all">모든 카테고리</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Transaction List */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                거래 내역이 없습니다
                            </div>
                        ) : (
                            filteredTransactions.map(transaction => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                                >

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: getCategoryColor(transaction.category) }}
                                                />
                                                <span className="font-semibold text-gray-800">{transaction.category}</span>
                                            </div>
                                            <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                                                {transaction.type === 'income' ? '수입' : '지출'}
                                            </Badge>
                                        </div>
                                        {transaction.description && (
                                            <p className="text-sm text-gray-600">{transaction.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(transaction.date).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditTransaction(transaction)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteTransaction(transaction.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transaction Form Dialog */}
            <TransactionFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                transaction={editingTransaction}
                onSave={handleSaveTransaction}
            />
        </div>
    )
}
