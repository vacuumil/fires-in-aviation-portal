'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Flame, AlertTriangle, BookOpen, Shield, Save, X } from 'lucide-react'

export default function SectionsAdminPage() {
  const [sections, setSections] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentSection, setCurrentSection] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'Flame',
    color: 'from-red-500 to-orange-500',
    order: 1
  })

  const icons = [
    { name: 'Flame', component: <Flame className="w-5 h-5" /> },
    { name: 'AlertTriangle', component: <AlertTriangle className="w-5 h-5" /> },
    { name: 'BookOpen', component: <BookOpen className="w-5 h-5" /> },
    { name: 'Shield', component: <Shield className="w-5 h-5" /> }
  ]

  const colors = [
    'from-red-500 to-orange-500',
    'from-orange-500 to-amber-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-indigo-500 to-blue-500'
  ]

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      const response = await fetch('/api/sections')
      if (response.ok) {
        const data = await response.json()
        setSections(data.sort((a: any, b: any) => a.order - b.order))
      }
    } catch (error) {
      console.error('Ошибка загрузки разделов:', error)
    }
  }

  const handleCreateSection = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      icon: 'Flame',
      color: 'from-red-500 to-orange-500',
      order: sections.length + 1
    })
    setCurrentSection(null)
    setIsEditing(true)
  }

  const handleEditSection = (section: any) => {
    setCurrentSection(section)
    setFormData(section)
    setIsEditing(true)
  }

  const handleSaveSection = async () => {
    try {
      const response = await fetch('/api/sections', {
        method: currentSection ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        loadSections()
        setIsEditing(false)
        setCurrentSection(null)
        alert(currentSection ? 'Раздел обновлен!' : 'Раздел создан!')
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      alert('Ошибка сохранения')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление разделами сайта</h1>
              <p className="text-gray-600">Создавайте и редактируйте основные разделы сайта</p>
            </div>
            <button
              onClick={handleCreateSection}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Новый раздел
            </button>
          </div>

          {isEditing ? (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {currentSection ? 'Редактирование раздела' : 'Создание нового раздела'}
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название раздела *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Например: Пожары"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug (часть URL) *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase()})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Например: fires"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Краткое описание раздела..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
                    <div className="grid grid-cols-4 gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setFormData({...formData, icon: icon.name})}
                          className={`p-2 rounded-lg border ${
                            formData.icon === icon.name 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {icon.component}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Цветовая схема</label>
                    <div className="grid grid-cols-3 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({...formData, color})}
                          className={`h-8 rounded-lg ${color} ${
                            formData.color === color ? 'ring-2 ring-offset-2 ring-red-500' : ''
                          }`}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveSection}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sections.map((section) => (
              <div
                key={section.slug}
                className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                    <div className="text-white">
                      {icons.find(i => i.name === section.icon)?.component}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                <div className="text-xs text-gray-500">URL: /{section.slug}</div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a
                    href={`/${section.slug}`}
                    target="_blank"
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Перейти в раздел →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}