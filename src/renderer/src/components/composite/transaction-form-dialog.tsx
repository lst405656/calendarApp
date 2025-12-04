import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { Button } from '../base/button'
import { Input } from '../base/input'
import { Textarea } from '../base/textarea'
import { Label } from '../base/label'
import { Select } from '../base/select'
import { getLocalDateString } from '../../lib/date-utils'
import { useCategories } from '../../hooks/use-categories'

const formatKoreanAmount = (value: string) => {
  const num = parseInt(value, 10)
  if (isNaN(num) || num === 0) return '0원'

  const man = Math.floor(num / 10000)
  const chun = Math.floor((num % 10000) / 1000)

  if (man > 0 && chun > 0) return `${man}만원 ${chun}천원`
  if (man > 0) return `${man}만원`
  return `${chun}천원`
}

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: {
    id: number
    date: string
    amount: number
    type: 'income' | 'expense'
    category: string
    description?: string
  }
  defaultDate?: string
  onSave: (transaction: any) => void
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultDate,
  onSave
}: TransactionFormDialogProps) {
  const { categories: allCategories } = useCategories()
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction?.amount.toString() || '')
  const [category, setCategory] = useState(transaction?.category || '')
  const [date, setDate] = useState(transaction?.date || defaultDate || getLocalDateString())
  const [description, setDescription] = useState(transaction?.description || '')

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setCategory(transaction.category)
      setDate(transaction.date)
      setDescription(transaction.description || '')
    } else {
      setType('expense')
      setAmount('')
      setCategory('')
      setDate(defaultDate || getLocalDateString())
      setDescription('')
    }
  }, [transaction, defaultDate, open])

  const normalizeAmount = (val: string) => {
    const num = Math.max(0, parseInt(val || '0', 10) || 0)
    if (num === 0) return 0
    return Math.ceil(num / 10000) * 10000
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transactionData = {
      date,
      amount: normalizeAmount(amount),
      type,
      category,
      description: description || undefined
    }

    onSave(transactionData)
    onOpenChange(false)
  }

  const categories = allCategories.filter((cat) => cat.type === type).map((cat) => cat.name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{transaction ? '거래 수정' : '새 거래 추가'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="type">유형</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as 'income' | 'expense')
                  setCategory('') // Reset category when type changes
                }}
                required
              >
                <option value="income">수입</option>
                <option value="expense">지출</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '')
                  setAmount(raw)
                }}
                onBlur={(e) => {
                  const normalized = normalizeAmount(e.target.value)
                  setAmount(normalized.toString())
                }}
                placeholder="금액을 입력하세요"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formatKoreanAmount(amount)}
              </div>
            </div>

            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="date">날짜</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="거래에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{transaction ? '수정' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
