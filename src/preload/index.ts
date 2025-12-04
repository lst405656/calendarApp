import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getEvents: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('get-events', startDate, endDate),
  addEvent: (event: any) => ipcRenderer.invoke('add-event', event),
  updateEvent: (id: number, event: any) => ipcRenderer.invoke('update-event', id, event),
  deleteEvent: (id: number) => ipcRenderer.invoke('delete-event', id),
  getTransactions: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('get-transactions', startDate, endDate),
  addTransaction: (transaction: any) => ipcRenderer.invoke('add-transaction', transaction),
  updateTransaction: (id: number, transaction: any) =>
    ipcRenderer.invoke('update-transaction', id, transaction),
  deleteTransaction: (id: number) => ipcRenderer.invoke('delete-transaction', id),
  getMonthlyStats: (year: number, month: number) =>
    ipcRenderer.invoke('get-monthly-stats', year, month),
  getDailyTransactions: (year: number, month: number) =>
    ipcRenderer.invoke('get-daily-transactions', year, month),
  getRecentTransactions: (limit?: number) => ipcRenderer.invoke('get-recent-transactions', limit)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
