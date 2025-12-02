export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function getMonthName(month: number): string {
  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]
  return months[month]
}

export function getDayName(day: number): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[day]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

// 로컬 날짜를 YYYY-MM-DD 형식으로 반환 (시간대 문제 해결)
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 로컬 날짜/시간을 ISO 형식으로 반환 (시간대 문제 해결)
export function getLocalDateTimeString(date: Date = new Date()): string {
  const dateStr = getLocalDateString(date)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${dateStr}T${hours}:${minutes}:${seconds}`
}

// 날짜 문자열에서 날짜 부분만 추출 (YYYY-MM-DD)
export function extractDatePart(dateString: string): string {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

// 두 날짜 문자열이 같은 날짜인지 비교
export function isSameDateString(date1: string, date2: string): boolean {
  return extractDatePart(date1) === extractDatePart(date2)
}
