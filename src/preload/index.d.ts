import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getEvents: (startDate: string, endDate: string) => Promise<any[]>
      addEvent: (event: any) => Promise<any>
      updateEvent: (id: number, event: any) => Promise<any>
      deleteEvent: (id: number) => Promise<any>
      getTransactions: (startDate: string, endDate: string) => Promise<any[]>
      addTransaction: (transaction: any) => Promise<any>
      updateTransaction: (id: number, transaction: any) => Promise<any>
      deleteTransaction: (id: number) => Promise<any>
    }
  }
}
