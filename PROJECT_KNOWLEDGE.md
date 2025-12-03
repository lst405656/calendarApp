# Project Knowledge: Calendar App

## 1. Project Overview
**Name**: `calendar-app`
**Description**: A desktop application combining a Calendar and a Household Account Book (Ledger), built with Electron and React.
**Target Platform**: Windows (Portable & Installer), macOS (configured but primarily targeting Windows for portable use).

## 2. Technology Stack
- **Core**: Electron, React, TypeScript
- **Build Tool**: Vite (electron-vite)
- **Styling**: TailwindCSS
- **Database**: SQLite (`better-sqlite3`)
- **Packaging**: `electron-builder`
- **Auto-Update**: `electron-updater`

## 3. Key Features

### A. Calendar Management
- **Functionality**: Create, read, update, and delete events.
- **Data**: Title, Start Date, End Date, Description, Color.
- **View**: Monthly calendar view.

### B. Ledger (Household Account Book)
- **Functionality**: Track income and expenses.
- **Data**: Date, Amount, Type (Income/Expense), Category, Description.
- **Integration**: Likely integrated with the calendar view or separate list view.

### C. Settings
- **Functionality**: Manage application settings.
- **Categories**: Custom categories for ledger items, likely with color coding.

### D. Data Persistence
- **Database**: Local SQLite database (`calendar-app.db`).
- **Location**:
    - **Development**: Default `userData` directory.
    - **Production (Portable)**: `data` directory located next to the executable file.

### E. Deployment & Updates
- **Build Targets**:
    - `nsis`: Standard Windows Installer (supports auto-updates).
    - `portable`: Single executable file (data stored locally).
- **Auto-Update**:
    - Source: GitHub Releases (`lst405656/calendarApp`).
    - Mechanism: Checks for updates on app launch (in production).

## 4. Project Structure
- **`src/main`**: Backend logic (Electron main process).
    - `index.ts`: App lifecycle, IPC handlers, Window creation, Auto-update check.
    - `db.ts`: Database schema definition and SQL queries.
- **`src/renderer`**: Frontend UI (React).
    - `pages/CalendarPage.tsx`: Main calendar interface.
    - `pages/LedgerPage.tsx`: Ledger interface.
    - `pages/SettingsPage.tsx`: Settings interface.
- **Configuration**:
    - `electron-builder.yml`: Build settings, publish configuration.
    - `package.json`: Dependencies and scripts.

## 5. Development & Build Scripts
- **Run Locally**: `npm run dev`
- **Build for Windows**: `npm run build:win` (Creates both Installer and Portable exe)
- **Type Check**: `npm run typecheck`

## 6. Recent Changes (Auto-Update & Portable)
- **Portable Data**: `src/main/index.ts` modified to set `userData` path to `./data` relative to the executable in production mode.
- **GitHub Publish**: `electron-builder.yml` configured to publish releases to `lst405656/calendarApp`.
- **Dual Build**: Windows build target set to generate both `nsis` (for updates) and `portable` (for portability).
