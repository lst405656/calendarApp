import { useState, useEffect } from 'react'

export interface Category {
  id: number
  name: string
  color: string
  type: 'income' | 'expense'
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: '식비', color: '#ef4444', type: 'expense' },
  { id: 2, name: '교통비', color: '#3b82f6', type: 'expense' },
  { id: 3, name: '쇼핑', color: '#10b981', type: 'expense' },
  { id: 4, name: '급여', color: '#f59e0b', type: 'income' },
  { id: 5, name: '용돈', color: '#8b5cf6', type: 'income' }
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('categories')
    if (stored) {
      setCategories(JSON.parse(stored))
    } else {
      setCategories(DEFAULT_CATEGORIES)
      localStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES))
    }
  }, [])

  const addCategory = (name: string, type: 'income' | 'expense', color: string) => {
    const newCategory: Category = {
      id: Date.now(),
      name,
      type,
      color
    }
    const updated = [...categories, newCategory]
    setCategories(updated)
    localStorage.setItem('categories', JSON.stringify(updated))
  }

  const deleteCategory = (id: number) => {
    const updated = categories.filter((c) => c.id !== id)
    setCategories(updated)
    localStorage.setItem('categories', JSON.stringify(updated))
  }

  const getCategoryColor = (name: string) => {
    const category = categories.find((c) => c.name === name)
    return category ? category.color : '#9ca3af' // Default gray
  }

  return {
    categories,
    addCategory,
    deleteCategory,
    getCategoryColor
  }
}
