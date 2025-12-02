import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';

const dbPath = join(app.getPath('userData'), 'calendar-app.db');
const db = new Database(dbPath);

export function initDB() {
  // 기존 테이블 삭제 (개발 중이므로 데이터 초기화)
  db.exec(`DROP TABLE IF EXISTS events`);
  db.exec(`DROP TABLE IF EXISTS transactions`);
  
  // 캘린더 이벤트 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      description TEXT,
      color TEXT
    )
  `);

  // 가계부 내역 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      description TEXT
    )
  `);
  
  console.log('Database initialized at:', dbPath);
}

export function getEvents(startDate: string, endDate: string) {
  const stmt = db.prepare('SELECT * FROM events WHERE start_date >= ? AND start_date <= ?');
  return stmt.all(startDate, endDate);
}

export function addEvent(event: { title: string, start_date: string, end_date: string, description?: string, color?: string }) {
  const stmt = db.prepare('INSERT INTO events (title, start_date, end_date, description, color) VALUES (@title, @start_date, @end_date, @description, @color)');
  return stmt.run(event);
}

export function getTransactions(startDate: string, endDate: string) {
  const stmt = db.prepare('SELECT * FROM transactions WHERE date >= ? AND date <= ?');
  return stmt.all(startDate, endDate);
}

export function addTransaction(transaction: { date: string, amount: number, type: 'income' | 'expense', category: string, description?: string }) {
  const stmt = db.prepare('INSERT INTO transactions (date, amount, type, category, description) VALUES (@date, @amount, @type, @category, @description)');
  return stmt.run(transaction);
}

export function updateTransaction(id: number, transaction: { date: string, amount: number, type: 'income' | 'expense', category: string, description?: string }) {
  const stmt = db.prepare('UPDATE transactions SET date = @date, amount = @amount, type = @type, category = @category, description = @description WHERE id = @id');
  return stmt.run({ id, ...transaction });
}

export function deleteTransaction(id: number) {
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  return stmt.run(id);
}

export function updateEvent(id: number, event: { title: string, start_date: string, end_date: string, description?: string, color?: string }) {
  const stmt = db.prepare('UPDATE events SET title = @title, start_date = @start_date, end_date = @end_date, description = @description, color = @color WHERE id = @id');
  return stmt.run({ id, ...event });
}

export function deleteEvent(id: number) {
  const stmt = db.prepare('DELETE FROM events WHERE id = ?');
  return stmt.run(id);
}
