import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
import * as db from './db'

function setupAutoUpdates(): void {
  if (!app.isPackaged) {
    return
  }

  autoUpdater.autoDownload = false

  autoUpdater.on('error', (error) => {
    dialog.showErrorBox('업데이트 오류', error?.message ?? '업데이트 중 오류가 발생했습니다.')
  })

  autoUpdater.on('update-available', async (info) => {
    const currentVersion = app.getVersion()
    const result = await dialog.showMessageBox({
      type: 'info',
      title: '업데이트 확인',
      message: `새 버전 ${info.version}이(가) 있습니다. (현재 버전: ${currentVersion})\n업데이트를 진행할까요?`,
      buttons: ['업데이트', '취소'],
      defaultId: 0,
      cancelId: 1
    })

    if (result.response === 0) {
      autoUpdater.downloadUpdate()
    }
  })

  autoUpdater.on('update-downloaded', async () => {
    const result = await dialog.showMessageBox({
      type: 'question',
      title: '업데이트 다운로드 완료',
      message: '업데이트를 설치하려면 앱을 재시작해야 합니다. 지금 재시작할까요?',
      buttons: ['지금 재시작', '나중에'],
      defaultId: 0,
      cancelId: 1
    })

    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })

  void autoUpdater.checkForUpdates().catch((error) => {
    dialog.showErrorBox('업데이트 확인 실패', error?.message ?? '업데이트 서버에 연결할 수 없습니다.')
  })
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize Database
  db.initDB()

  // IPC Handlers
  ipcMain.handle('get-events', (_, startDate: string, endDate: string) => {
    return db.getEvents(startDate, endDate)
  })
  ipcMain.handle('add-event', (_, event) => {
    return db.addEvent(event)
  })
  ipcMain.handle('update-event', (_, id: number, event) => {
    return db.updateEvent(id, event)
  })
  ipcMain.handle('delete-event', (_, id: number) => {
    return db.deleteEvent(id)
  })

  ipcMain.handle('get-transactions', (_, startDate: string, endDate: string) => {
    return db.getTransactions(startDate, endDate)
  })
  ipcMain.handle('add-transaction', (_, transaction) => {
    return db.addTransaction(transaction)
  })
  ipcMain.handle('update-transaction', (_, id: number, transaction) => {
    return db.updateTransaction(id, transaction)
  })
  ipcMain.handle('delete-transaction', (_, id: number) => {
    return db.deleteTransaction(id)
  })

  // Dashboard statistics handlers
  ipcMain.handle('get-monthly-stats', (_, year: number, month: number) => {
    return db.getMonthlyStats(year, month)
  })
  ipcMain.handle('get-daily-transactions', (_, year: number, month: number) => {
    return db.getDailyTransactions(year, month)
  })
  ipcMain.handle('get-recent-transactions', (_, limit?: number) => {
    return db.getRecentTransactions(limit)
  })
  ipcMain.handle('get-today-events', () => {
    return db.getTodayEvents()
  })
  ipcMain.handle('get-weekly-category-stats', () => {
    return db.getWeeklyCategoryStats()
  })

  createWindow()
  setupAutoUpdates()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
