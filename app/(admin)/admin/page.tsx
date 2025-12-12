// app/(admin)/admin/page.tsx - АДАПТИВНАЯ ВЕРСИЯ
'use client'

import { useState, useEffect } from 'react'
import { 
  Book, Edit, FileText, Calendar, User, 
  Eye, Plus, ArrowRight, ExternalLink,
  BarChart3, Database, LogOut
} from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

interface Topic {
  id: number
  title: string
  description: string
  date: string
  author: string
  section?: string
}

interface Stats {
  total: number
  lastUpdated: string
  completed: number
  bySection?: {
    fires: number
    emergency: number
    education: number
    protection: number
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    lastUpdated: '',
    completed: 0
  })
  
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Проверяем авторизацию
    const authCookie = Cookies.get('admin-auth')
    if (authCookie !== 'authenticated') {
      router.push('/admin/login')
      return
    }
    setAuthChecked(true)
    
    loadTopics()
  }, [router])

  const loadTopics = async () => {
    setLoading(true)
    try {
      // Загружаем темы по разделам отдельно
      const sectionsData: Record<string, Topic[]> = {}
      let totalTopics = 0
      
      for (const section of ['fires', 'emergency', 'education', 'protection']) {
        const response = await fetch(`/api/sections/${section}`)
        if (response.ok) {
          const data = await response.json()
          sectionsData[section] = data
          totalTopics += data.length
        }
      }
      
      // Объединяем все темы
      const allTopics: Topic[] = []
      Object.entries(sectionsData).forEach(([section, topics]) => {
        topics.forEach(topic => {
          topic.section = section
          allTopics.push(topic)
        })
      })
      
      setTopics(allTopics)
      
      // Рассчитываем статистику по разделам
      const bySection = {
        fires: sectionsData.fires?.length || 0,
        emergency: sectionsData.emergency?.length || 0,
        education: sectionsData.education?.length || 0,
        protection: sectionsData.protection?.length || 0
      }
      
      setStats({
        total: totalTopics,
        lastUpdated: allTopics[0]?.date || '',
        completed: Math.round((totalTopics / 100) * 100),
        bySection
      })
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      Cookies.remove('admin-auth')
      router.push('/admin/login')
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок и кнопка выхода */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              🚀 Панель управления порталом
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Управление образовательным порталом "Безопасность в авиации"
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors self-center sm:self-auto w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </button>
        </div>

        {/* Карточки выбора */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link href="/admin/simple" className="group">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full min-h-[140px] sm:min-h-40 flex flex-col justify-between">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-blue-200 transition-colors">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Редактор тем</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Создание и редактирование</p>
                </div>
              </div>
              <div className="text-blue-600 font-medium text-sm sm:text-base flex items-center">
                <span>Перейти</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/admin/hero" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 h-full">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                  <Edit className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Главная страница</h3>
                  <p className="text-sm text-gray-500">Редактирование текста</p>
                </div>
              </div>
              <div className="text-purple-600 font-medium flex items-center">
                <span>Редактировать</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/" target="_blank" className="group">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 h-full min-h-[140px] sm:min-h-40 flex flex-col justify-between">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-green-200 transition-colors">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Просмотр сайта</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Открыть портал</p>
                </div>
              </div>
              <div className="text-green-600 font-medium text-sm sm:text-base flex items-center">
                <span>Открыть</span>
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 min-h-[140px] sm:min-h-40">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Статистика</h3>
                <p className="text-xs sm:text-sm text-gray-500">{stats.total} тем всего</p>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {stats.completed}%
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 min-h-[140px] sm:min-h-40">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Данные</h3>
                <p className="text-xs sm:text-sm text-gray-500">Управление</p>
              </div>
            </div>
            <div className="text-orange-600 font-medium text-sm sm:text-base">
              Экспорт/Импорт
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">📊 Статистика курса</h2>
          
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>Общий прогресс по всем разделам</span>
              <span>{stats.total} тем всего</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
              <div 
                className="bg-linear-to-r from-blue-500 to-purple-600 h-3 sm:h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.total / 100) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-500">Всего тем</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {stats.bySection?.fires || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Темы "Пожары"</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                {stats.bySection ? 
                  Object.values(stats.bySection).reduce((a: number, b: number) => a + b, 0) 
                  : 0
                }
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Темы во всех разделах</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 mb-1 sm:mb-2">
                {stats.lastUpdated || '—'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Последнее обновление</div>
            </div>
          </div>
          
          {/* Детальная статистика по разделам */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Статистика по разделам</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { id: 'fires', name: 'Пожары', color: 'bg-red-100 text-red-800', count: stats.bySection?.fires || 0 },
                { id: 'emergency', name: 'ЧС', color: 'bg-orange-100 text-orange-800', count: stats.bySection?.emergency || 0 },
                { id: 'education', name: 'Образование', color: 'bg-blue-100 text-blue-800', count: stats.bySection?.education || 0 },
                { id: 'protection', name: 'Защита', color: 'bg-green-100 text-green-800', count: stats.bySection?.protection || 0 },
              ].map((section) => (
                <div key={section.id} className={`p-3 rounded-lg ${section.color.split(' ')[0]}`}>
                  <div className="text-base sm:text-lg font-bold">{section.count}</div>
                  <div className="text-xs sm:text-sm font-medium">{section.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Последние темы */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📚 Недавние темы</h2>
            <Link 
              href="/admin/simple" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center whitespace-nowrap text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить тему
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-500">Загрузка тем...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Book className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 mb-2">Темы еще не созданы</p>
              <Link 
                href="/admin/simple" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
              >
                Создать первую тему
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {topics.slice(0, 4).map((topic) => (
                topic && topic.id ? (
                  <div key={`topic-${topic.id}`} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold mr-3 sm:mr-4">
                        Тема {topic.id}
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{topic.title}</h3>
                    </div>
                    
                    {topic.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{topic.description}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 gap-1 sm:gap-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-3 sm:h-3 mr-1" />
                        <span>{topic.date}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 sm:w-3 sm:h-3 mr-1" />
                        <span>{topic.author}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 sm:mt-4">
                      {topic.section === 'fires' ? (
                        <a
                          href={`/topics/${topic.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                        >
                          👁️ Просмотр
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs sm:text-sm font-medium">
                          👁️ В разделе "{topic.section}"
                        </span>
                      )}
                      <Link
                        href="/admin/simple"
                        className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium"
                      >
                        ✏️ Редактировать
                      </Link>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
          
          {topics.length > 4 && (
            <div className="text-center mt-6 sm:mt-8">
              <Link 
                href="/admin/simple" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
              >
                Показать все {topics.length} тем
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Link>
            </div>
          )}
        </div>

        {/* Инструкция */}
        <div className="mt-6 sm:mt-12 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">📋 Как использовать</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2">1. Создание тем</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                Перейдите в <Link href="/admin/simple" className="text-blue-600 font-medium">Редактор тем</Link> и нажмите "Новая"
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2">2. Редактирование</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                Выберите тему из списка и нажмите ✏️ для редактирования
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2">3. Просмотр</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                Всегда проверяйте как тема выглядит на сайте
              </p>
            </div>
          </div>
        </div>

        {/* Информация о безопасности */}
        <div className="mt-4 sm:mt-8 bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-start">
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded-lg mr-3 sm:mr-4">
              <span className="text-lg sm:text-xl">🔒</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Безопасность</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                • После работы нажмите кнопку "Выйти"<br/>
                • Никому не сообщайте учетные данные<br/>
                • Измените пароль в настройках окружения
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}