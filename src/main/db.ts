import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

const dbPath = join(app.getPath('userData'), 'calendar-app.db')
const db = new Database(dbPath)

export function initDB() {
  // Create tables if they do not exist (preserve existing data)
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      description TEXT,
      color TEXT
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      description TEXT
    )
  `)

  console.log('Database initialized at:', dbPath)
}

export function getEvents(startDate: string, endDate: string) {
  const stmt = db.prepare('SELECT * FROM events WHERE start_date >= ? AND start_date <= ?')
  return stmt.all(startDate, endDate)
}

export function addEvent(event: {
  title: string
  start_date: string
  end_date: string
  description?: string
  color?: string
}) {
  const stmt = db.prepare(
    'INSERT INTO events (title, start_date, end_date, description, color) VALUES (@title, @start_date, @end_date, @description, @color)'
  )
  return stmt.run(event)
}

export function getTransactions(startDate: string, endDate: string) {
  const stmt = db.prepare('SELECT * FROM transactions WHERE date >= ? AND date <= ?')
  return stmt.all(startDate, endDate)
}

export function addTransaction(transaction: {
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description?: string
}) {
  const stmt = db.prepare(
    'INSERT INTO transactions (date, amount, type, category, description) VALUES (@date, @amount, @type, @category, @description)'
  )
  return stmt.run(transaction)
}

export function updateTransaction(
  id: number,
  transaction: {
    date: string
    amount: number
    type: 'income' | 'expense'
    category: string
    description?: string
  }
) {
  const stmt = db.prepare(
    'UPDATE transactions SET date = @date, amount = @amount, type = @type, category = @category, description = @description WHERE id = @id'
  )
  return stmt.run({ id, ...transaction })
}

export function deleteTransaction(id: number) {
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?')
  return stmt.run(id)
}

export function updateEvent(
  id: number,
  event: {
    title: string
    start_date: string
    end_date: string
    description?: string
    color?: string
  }
) {
  const stmt = db.prepare(
    'UPDATE events SET title = @title, start_date = @start_date, end_date = @end_date, description = @description, color = @color WHERE id = @id'
  )
  return stmt.run({ id, ...event })
}

export function deleteEvent(id: number) {
  const stmt = db.prepare('DELETE FROM events WHERE id = ?')
  return stmt.run(id)
}

// Dashboard statistics
export function getMonthlyStats(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

  // Get total income and expense for the month
  const currentMonthStmt = db.prepare(`
    SELECT 
      type,
      SUM(amount) as total
    FROM transactions 
    WHERE date >= ? AND date <= ?
    GROUP BY type
  `)
  const currentMonthResults = currentMonthStmt.all(startDate, endDate) as Array<{
    type: string
    total: number
  }>

  // Get previous month stats for comparison
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevStartDate = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01`
  const prevEndDate = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-31`

  const prevMonthStmt = db.prepare(`
    SELECT 
      type,
      SUM(amount) as total
    FROM transactions 
    WHERE date >= ? AND date <= ?
    GROUP BY type
  `)
  const prevMonthResults = prevMonthStmt.all(prevStartDate, prevEndDate) as Array<{
    type: string
    total: number
  }>

  const currentIncome = currentMonthResults.find((r) => r.type === 'income')?.total || 0
  const currentExpense = currentMonthResults.find((r) => r.type === 'expense')?.total || 0
  const prevIncome = prevMonthResults.find((r) => r.type === 'income')?.total || 0
  const prevExpense = prevMonthResults.find((r) => r.type === 'expense')?.total || 0

  // Calculate percentage changes
  const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0
  const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0

  // Get event count
  const eventStmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM events
    WHERE start_date >= ? AND start_date <= ?
  `)
  const eventCount = (eventStmt.get(startDate, endDate) as { count: number }).count

  // Get today's event count
  const today = new Date().toISOString().split('T')[0]
  const todayEventStmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM events
    WHERE start_date = ?
  `)
  const todayEventCount = (todayEventStmt.get(today) as { count: number }).count

  return {
    totalIncome: currentIncome,
    totalExpense: currentExpense,
    incomeChange,
    expenseChange,
    eventCount,
    todayEventCount
  }
}

export function getDailyTransactions(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`

  const stmt = db.prepare(`
    SELECT 
      date,
      type,
      SUM(amount) as total
    FROM transactions 
    WHERE date >= ? AND date <= ?
    GROUP BY date, type
    ORDER BY date
  `)

  return stmt.all(startDate, endDate) as Array<{
    date: string
    type: string
    total: number
  }>
}

export function getRecentTransactions(limit: number = 5) {
  const stmt = db.prepare(`
    SELECT *
    FROM transactions
    ORDER BY date DESC, id DESC
    LIMIT ?
  `)

  return stmt.all(limit)
}
