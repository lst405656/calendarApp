import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { Button } from '../base/button'
import { Input } from '../base/input'
import { Textarea } from '../base/textarea'
import { Label } from '../base/label'
import { getLocalDateString } from '../../lib/date-utils'

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: {
    id: number
    title: string
    start_date: string
    end_date: string
    description?: string
    color?: string
  }
  defaultDate?: string
  onSave: (event: any) => void
}

const COLORS = [
  { value: '#3b82f6', label: '파랑' },
  { value: '#ef4444', label: '빨강' },
  { value: '#10b981', label: '초록' },
  { value: '#f59e0b', label: '주황' },
  { value: '#8b5cf6', label: '보라' },
  { value: '#ec4899', label: '핑크' }
]

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSave
}: EventFormDialogProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [startDate, setStartDate] = useState(
    event?.start_date || defaultDate || getLocalDateString()
  )
  const [endDate, setEndDate] = useState(event?.end_date || defaultDate || getLocalDateString())
  const [description, setDescription] = useState(event?.description || '')
  const [color, setColor] = useState(event?.color || '#3b82f6')
  const [customColor, setCustomColor] = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStartDate(event.start_date)
      setEndDate(event.end_date)
      setDescription(event.description || '')
      setColor(event.color || '#3b82f6')
      setCustomColor(event.color || '')
    } else {
      setTitle('')
      setStartDate(defaultDate || getLocalDateString())
      setEndDate(defaultDate || getLocalDateString())
      setDescription('')
      setColor('#3b82f6')
      setCustomColor('')
    }
  }, [event, defaultDate, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const eventData = {
      title,
      start_date: startDate,
      end_date: endDate,
      description: description || undefined,
      color
    }

    onSave(eventData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{event ? '일정 수정' : '새 일정 추가'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="일정 제목을 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">시작일</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">종료일</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="color">색상</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
                <div className="flex items-center gap-2 mt-2 w-full">
                  <Input
                    type="color"
                    aria-label="Custom color picker"
                    value={/^#([0-9a-fA-F]{6})$/.test(customColor) ? customColor : color}
                    onChange={(e) => {
                      setColor(e.target.value)
                      setCustomColor(e.target.value)
                    }}
                    className="w-12 p-1 h-10"
                  />
                  <Input
                    aria-label="Custom color hex"
                    placeholder="#000000"
                    value={customColor}
                    onChange={(e) => {
                      const val = e.target.value
                      setCustomColor(val)
                      if (/^#([0-9a-fA-F]{6})$/.test(val)) {
                        setColor(val)
                      }
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">#RRGGBB 입력</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="일정에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{event ? '수정' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
