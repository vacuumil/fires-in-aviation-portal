// app/(admin)/admin/hero/page.tsx - НОВЫЙ ФАЙЛ
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Eye, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function HeroEditorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  
  const [heroText, setHeroText] = useState('Образовательная платформа по пожарной безопасности, чрезвычайным ситуациям и защите в авиации')
  const [originalText, setOriginalText] = useState('')
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    // Проверяем авторизацию
    const authCookie = Cookies.get('admin-auth')
    if (authCookie !== 'authenticated') {
      router.push('/admin/login')
      return
    }
    
    // Загружаем текущий текст
    loadHeroText()
  }, [router])

  const loadHeroText = () => {
    setLoading(true)
    try {
      // Загружаем из localStorage (или можно из API)
      const savedText = localStorage.getItem('heroText') || 
        'Образовательная платформа по пожарной безопасности, чрезвычайным ситуациям и защите в авиации'
      
      setHeroText(savedText)
      setOriginalText(savedText)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSave = async () => {
    if (!heroText.trim()) {
      showMessage('error', 'Введите текст для главной страницы')
      return
    }

    setSaving(true)
    try {
      // Сохраняем в localStorage (или можно в API)
      localStorage.setItem('heroText', heroText.trim())
      setOriginalText(heroText.trim())
      
      showMessage('success', 'Текст главной страницы сохранен!')
      
      // Можно добавить ревалидацию через API
      // await fetch('/api/revalidate?path=/')
      
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      showMessage('error', 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setHeroText(originalText)
    showMessage('success', 'Изменения отменены')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок и навигация */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад в админ-панель
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              📝 Редактор главной страницы
            </h1>
            <p className="text-gray-600">
              Редактирование текста на главном экране сайта
            </p>
          </div>
        </div>

        {/* Сообщения */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? '✅' : '❌'}
              <span className="ml-2">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - редактор */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Редактор текста</h2>
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Eye className="w-4 h-4" />
                {preview ? 'Редактировать' : 'Предпросмотр'}
              </button>
            </div>

            {preview ? (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Предпросмотр:</h3>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {heroText}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Текст под заголовком на главной странице:
                  </label>
                  <textarea
                    value={heroText}
                    onChange={(e) => setHeroText(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="Введите текст для главной страницы..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Этот текст отображается под заголовком "Безопасность в авиации" на главной странице.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || heroText.trim() === originalText}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Сохранить изменения
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    disabled={heroText.trim() === originalText}
                    className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Отменить
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Правая колонка - инструкция и предпросмотр */}
          <div className="space-y-6">
            <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Инструкция</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Текст должен быть кратким и информативным</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Рекомендуемая длина: 60-120 символов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Текст отображается на главном экране сайта</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Изменения сохраняются автоматически</span>
                </li>
              </ul>
            </div>

            <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
              {/* Декоративный фон */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">📱 Как это выглядит:</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-block px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm mb-4">
                      Образовательный портал
                    </div>
                    <h4 className="text-2xl font-bold mb-3">
                      Безопасность<br />
                      <span className="bg-linear-to-r from-white to-red-200 bg-clip-text text-transparent">
                        в авиации
                      </span>
                    </h4>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {heroText.length > 100 ? `${heroText.substring(0, 100)}...` : heroText}
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-6">
                    <div className="flex items-center justify-between">
                      <span>Текущая длина: {heroText.length} символов</span>
                      <span>{heroText.length > 120 ? '⚠️ Слишком длинно' : '✅ Оптимально'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}