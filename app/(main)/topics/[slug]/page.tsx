// app/(main)/topics/[slug]/page.tsx - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ С КЭШИРОВАНИЕМ
import { getTopicByNumber, getTopicsBySection } from '@/app/lib/cms/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Home, BookOpen, Calendar, User, Flame, AlertTriangle, GraduationCap, Shield } from 'lucide-react'
import MarkdownRenderer from '@/app/components/ui/MarkdownRenderer'

// Настройки кэширования
export const revalidate = 60 // Ревалидация каждые 60 секунд
export const dynamic = 'force-static' // Статическая генерация

const sectionConfig = {
  fires: {
    title: 'Пожары',
    icon: <Flame className="w-5 h-5" />,
    linear: 'from-red-500 to-orange-500',
    color: 'text-red-600'
  },
  emergency: {
    title: 'Чрезвычайные ситуации',
    icon: <AlertTriangle className="w-5 h-5" />,
    linear: 'from-orange-500 to-amber-500',
    color: 'text-orange-600'
  },
  education: {
    title: 'Образование',
    icon: <GraduationCap className="w-5 h-5" />,
    linear: 'from-blue-500 to-cyan-500',
    color: 'text-blue-600'
  },
  protection: {
    title: 'Защита',
    icon: <Shield className="w-5 h-5" />,
    linear: 'from-green-500 to-emerald-500',
    color: 'text-green-600'
  }
}

// Генерируем статические пути для тем
export async function generateStaticParams() {
  // Получаем все темы для генерации статических путей
  try {
    const sections = ['fires', 'emergency', 'education', 'protection']
    const allTopics: { slug: string }[] = []
    
    for (const section of sections) {
      // Используем прямой fetch без кэширования для build
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/github/topics?section=${section}`,
        { next: { revalidate: 3600 } } // Кэшируем на 1 час для build
      )
      
      if (response.ok) {
        const topics = await response.json()
        topics.forEach((topic: any) => {
          allTopics.push({ slug: topic.topic_number.toString() })
        })
      }
    }
    
    // Ограничиваем количество для build (первые 50 тем)
    return allTopics.slice(0, 50)
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Метаданные для SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const topicNumber = parseInt(resolvedParams.slug)
  const topic = await getTopicByNumber(topicNumber)
  
  if (!topic) {
    return {
      title: 'Тема не найдена',
      description: 'Запрошенная тема не существует'
    }
  }
  
  return {
    title: `${topic.title} | Безопасность в авиации`,
    description: topic.description || `Изучите тему ${topic.topic_number} по безопасности в авиации`,
    keywords: topic.keywords?.join(', ') || 'безопасность, авиация, обучение'
  }
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const topicNumber = parseInt(resolvedParams.slug)
  
  // Получаем тему с кэшированием
  const topic = await getTopicByNumber(topicNumber)
  
  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Тема не найдена</h1>
          <p className="text-gray-600 mb-6">Тема №{topicNumber} не существует или еще не создана.</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Link>
        </div>
      </div>
    )
  }

  // Определяем раздел темы
  const section = topic.section || 'fires'
  const sectionInfo = sectionConfig[section as keyof typeof sectionConfig] || sectionConfig.fires

  // Получаем темы только этого раздела (с кэшированием)
  const sectionTopics = await getTopicsBySection(section)
  
  // Находим текущий индекс и соседние темы
  const currentIndex = sectionTopics.findIndex(t => t.topic_number === topicNumber)
  const prevTopic = currentIndex > 0 ? sectionTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < sectionTopics.length - 1 ? sectionTopics[currentIndex + 1] : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Навигация */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/${section}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-red-600 transition-colors">
                Назад к разделу "{sectionInfo.title}"
              </span>
            </Link>
            
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Тема {topic.topic_number} из {sectionTopics.length} в разделе
            </div>
          </div>

          {/* Навигация по темам в разделе */}
          {(prevTopic || nextTopic) && (
            <div className="flex justify-between mb-6">
              {prevTopic ? (
                <Link
                  href={`/topics/${prevTopic.topic_number}`}
                  className="inline-flex items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group border border-gray-200 hover:border-gray-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-2 text-gray-500 group-hover:text-red-600 transition-colors" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500 group-hover:text-gray-700">Предыдущая</div>
                    <div className="font-medium truncate max-w-[180px] group-hover:text-red-600 transition-colors">
                      {prevTopic.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div></div>
              )}

              {nextTopic ? (
                <Link
                  href={`/topics/${nextTopic.topic_number}`}
                  className="inline-flex items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group border border-gray-200 hover:border-gray-300"
                >
                  <div className="text-right mr-2">
                    <div className="text-xs text-gray-500 group-hover:text-gray-700">Следующая</div>
                    <div className="font-medium truncate max-w-[180px] group-hover:text-red-600 transition-colors">
                      {nextTopic.title}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          )}
        </div>

        {/* Индикатор раздела */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-lg bg-linear-to-r ${sectionInfo.linear} bg-opacity-10 border border-gray-200 shadow-sm`}>
            <div className={`mr-2 ${sectionInfo.color}`}>
              {sectionInfo.icon}
            </div>
            <span className={`font-semibold ${sectionInfo.color}`}>
              Раздел: {sectionInfo.title}
            </span>
          </div>
        </div>

        {/* Заголовок темы */}
        <div className="mb-8">
          <div className="flex items-start mb-4">
            <div className={`w-12 h-12 bg-linear-to-r ${sectionInfo.linear} text-white rounded-lg flex items-center justify-center font-bold text-lg mr-4 shrink-0 shadow-md`}>
              {topic.topic_number}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{topic.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 shrink-0" />
                  <span className="text-sm">{new Date(topic.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5 shrink-0" />
                  <span className="text-sm">{topic.author}</span>
                </div>
              </div>
            </div>
          </div>

          {topic.description && (
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 shadow-sm">
              <p className="text-gray-700 italic text-sm md:text-base leading-relaxed">{topic.description}</p>
            </div>
          )}

          {topic.keywords && topic.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {topic.keywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Контент темы */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
            <MarkdownRenderer content={topic.body} />
          </div>
        </div>

        {/* Навигация внизу */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Изучите все {sectionTopics.length} тем в разделе "{sectionInfo.title}"
            </div>
            
            <div className="flex flex-wrap gap-2">
              {prevTopic && (
                <Link
                  href={`/topics/${prevTopic.topic_number}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Назад
                </Link>
              )}
              
              <Link
                href={`/${section}`}
                className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Все темы раздела
              </Link>
              
              {nextTopic && (
                <Link
                  href={`/topics/${nextTopic.topic_number}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium text-sm"
                >
                  Далее
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Быстрая навигация по разделам */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Другие разделы</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sectionConfig).map(([key, config]) => (
              key !== section && (
                <Link
                  key={key}
                  href={`/${key}`}
                  className={`inline-flex items-center justify-center px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm ${config.color} bg-white`}
                >
                  <span className="font-medium">{config.title}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}