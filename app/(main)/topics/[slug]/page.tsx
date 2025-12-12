// app/(main)/topics/[slug]/page.tsx - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
import { getTopicByNumber, getTopicsBySection } from '@/app/lib/cms/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Home, BookOpen, Calendar, User, Flame, AlertTriangle, GraduationCap, Shield } from 'lucide-react'
import MarkdownRenderer from '@/app/components/ui/MarkdownRenderer'

const sectionConfig = {
  fires: {
    title: 'Пожары',
    icon: <Flame className="w-5 h-5" />,
    gradient: 'from-red-500 to-orange-500',
    color: 'from-red-500 to-orange-500'
  },
  emergency: {
    title: 'Чрезвычайные ситуации',
    icon: <AlertTriangle className="w-5 h-5" />,
    gradient: 'from-orange-500 to-amber-500',
    color: 'from-orange-500 to-amber-500'
  },
  education: {
    title: 'Образование',
    icon: <GraduationCap className="w-5 h-5" />,
    gradient: 'from-blue-500 to-cyan-500',
    color: 'from-blue-500 to-cyan-500'
  },
  protection: {
    title: 'Защита',
    icon: <Shield className="w-5 h-5" />,
    gradient: 'from-green-500 to-emerald-500',
    color: 'from-green-500 to-emerald-500'
  }
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const topicNumber = parseInt(resolvedParams.slug)
  
  // Получаем тему напрямую
  const topic = await getTopicByNumber(topicNumber)
  
  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Тема не найдена</h1>
        <p className="text-gray-600 mb-4">Тема №{topicNumber} не существует или еще не создана.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  // Определяем раздел темы
  const section = topic.section || 'fires'
  const sectionInfo = sectionConfig[section as keyof typeof sectionConfig] || sectionConfig.fires

  // Получаем темы только этого раздела
  const sectionTopics = await getTopicsBySection(section)
  
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
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <Home className="w-4 h-4 mr-2" />
              Назад к разделу "{sectionInfo.title}"
            </Link>
            
            <div className="text-sm text-gray-500">
              Тема {topic.topic_number} из {sectionTopics.length} в разделе
            </div>
          </div>

          {/* Навигация по темам в разделе */}
          <div className="flex justify-between mb-6">
            {prevTopic ? (
              <Link
                href={`/topics/${prevTopic.topic_number}`}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Предыдущая</div>
                  <div className="font-medium truncate max-w-[200px]">{prevTopic.title}</div>
                </div>
              </Link>
            ) : (
              <div></div>
            )}

            {nextTopic ? (
              <Link
                href={`/topics/${nextTopic.topic_number}`}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="text-right mr-2">
                  <div className="text-xs text-gray-500">Следующая</div>
                  <div className="font-medium truncate max-w-[200px]">{nextTopic.title}</div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        {/* Индикатор раздела */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-lg bg-linear-to-r ${sectionInfo.gradient} bg-opacity-10`}>
            <div className="mr-2">
              {sectionInfo.icon}
            </div>
            <span className={`font-medium bg-linear-to-r ${sectionInfo.gradient} bg-clip-text text-transparent`}>
              Раздел: {sectionInfo.title}
            </span>
          </div>
        </div>

        {/* Заголовок темы */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 bg-linear-to-r ${sectionInfo.gradient} text-white rounded-lg flex items-center justify-center font-bold text-lg mr-4`}>
              {topic.topic_number}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(topic.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{topic.author}</span>
                </div>
              </div>
            </div>
          </div>

          {topic.description && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
              <p className="text-gray-700 italic">{topic.description}</p>
            </div>
          )}
        </div>

        {/* Контент темы */}
        <div className="prose prose-lg max-w-none mb-12">
          <MarkdownRenderer content={topic.body} />
        </div>

        {/* Навигация внизу */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Изучите все {sectionTopics.length} тем в разделе "{sectionInfo.title}"
            </div>
            
            <div className="flex gap-3">
              {prevTopic && (
                <Link
                  href={`/topics/${prevTopic.topic_number}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Назад
                </Link>
              )}
              
              <Link
                href={`/${section}`}
                className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Все темы раздела
              </Link>
              
              {nextTopic && (
                <Link
                  href={`/topics/${nextTopic.topic_number}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Далее
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}