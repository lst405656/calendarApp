import { useState } from "react"
import { Label } from "../components/base/label"
import { Select } from "../components/base/select"
import { Checkbox } from "../components/base/checkbox"
import { Input } from "../components/base/input"
import { Button } from "../components/base/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/composite/card"
import { Plus, X } from "lucide-react"
import { useCategories } from "../hooks/use-categories"

export function SettingsPage() {
    const { categories, addCategory, deleteCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense')
    const [selectedColor, setSelectedColor] = useState('#3b82f6')

    // Mock state for colors (Event colors)
    const [colors, setColors] = useState([
        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
    ])
    const [newColor, setNewColor] = useState('#000000')

    const handleAddCategory = () => {
        if (!newCategory.trim()) return
        addCategory(newCategory, activeTab, selectedColor)
        setNewCategory('')
    }

    const handleAddColor = () => {
        if (!colors.includes(newColor)) {
            setColors([...colors, newColor])
        }
    }

    const handleDeleteColor = (colorToDelete: string) => {
        setColors(colors.filter(c => c !== colorToDelete))
    }

    return (
        <div className="p-8 h-full overflow-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">설정</h2>

            <div className="space-y-6 max-w-2xl">
                {/* Theme Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>테마 설정</CardTitle>
                        <CardDescription>앱의 외관을 변경합니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode">다크 모드</Label>
                            <Checkbox id="dark-mode" />
                        </div>
                    </CardContent>
                </Card>

                {/* Language Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>언어 설정</CardTitle>
                        <CardDescription>앱에서 사용할 언어를 선택합니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="language">언어</Label>
                            <Select id="language">
                                <option value="ko">한국어</option>
                                <option value="en">English</option>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>카테고리 관리</CardTitle>
                        <CardDescription>
                            일정 및 거래 내역에 사용할 카테고리를 관리합니다.
                            <span className="block text-xs text-gray-500 mt-1">* 지정된 색상은 차트 분석 및 거래 내역 태그에 사용되어 시각적인 구분을 돕습니다.</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                            <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                onClick={() => setActiveTab('expense')}
                            >
                                지출
                            </button>
                            <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                onClick={() => setActiveTab('income')}
                            >
                                수입
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    placeholder={`${activeTab === 'expense' ? '지출' : '수입'} 카테고리 이름`}
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <Button onClick={handleAddCategory} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Color Selection */}
                            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#6b7280'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {categories.filter(c => c.type === activeTab).map(category => (
                                <div key={category.id} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: category.color }} />
                                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => deleteCategory(category.id)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {categories.filter(c => c.type === activeTab).length === 0 && (
                                <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    등록된 카테고리가 없습니다.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Event Color Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>일정 색상 관리</CardTitle>
                        <CardDescription>일정에 사용할 수 있는 색상을 관리합니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <Input
                                    type="color"
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                />
                            </div>
                            <Input
                                placeholder="색상 코드 (예: #000000)"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={handleAddColor}>추가</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(color => (
                                <div key={color} className="group relative">
                                    <div
                                        className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                    <button
                                        className="absolute -top-1 -right-1 bg-white rounded-full border border-gray-200 shadow-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                        onClick={() => handleDeleteColor(color)}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
