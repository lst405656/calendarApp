import { Link, Outlet, useLocation } from 'react-router-dom'
import { Calendar, CreditCard, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { useState, useEffect } from 'react'
import { Button } from '../components/base/button'

export function AppLayout() {
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(240)
    const [isResizing, setIsResizing] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return
            const newWidth = e.clientX
            if (newWidth >= 180 && newWidth <= 400) {
                setSidebarWidth(newWidth)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing])

    const navItems = [
        { path: '/', icon: Calendar, label: '캘린더' },
        { path: '/ledger', icon: CreditCard, label: '가계부' },
        { path: '/settings', icon: Settings, label: '설정' },
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            {sidebarOpen && (
                <>
                    <aside
                        className="bg-white border-r border-gray-200 flex flex-col relative"
                        style={{ width: `${sidebarWidth}px` }}
                    >
                        {/* Close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-2 z-10"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-800">Calendar App</h1>
                        </div>
                        <nav className="flex-1 px-4">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors',
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </aside>

                    {/* Resize handle */}
                    <div
                        className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize transition-colors"
                        onMouseDown={() => setIsResizing(true)}
                    />
                </>
            )}

            {/* Reopen button when sidebar is closed */}
            {!sidebarOpen && (
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 left-4 z-10"
                    onClick={() => setSidebarOpen(true)}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            )}

            {/* Main content */}
            <main className="flex-1 overflow-hidden">
                <Outlet />
            </main>
        </div>
    )
}
