// app/(main)/topics/education/[id]/page.tsx
import { getAllTopics, getTopicByNumber } from '@/app/lib/cms/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Home, BookOpen, Calendar, User, GraduationCap } from 'lucide-react'
import MarkdownRenderer from '@/app/components/ui/MarkdownRenderer'
import { notFound } from 'next/navigation'

export default async function EducationTopicPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const topicNumber = parseInt(id)
  
  // Проверяем что тема в диапазоне education (201-299)
  if (topicNumber < 201 || topicNumber > 299) {
    return notFound()
  }
  
  const topic = await getTopicByNumber(topicNumber)
  const allTopics = await getAllTopics()

  if (!topic || topic.section !== 'education') {
    return notFound()
  }

  // Находим только темы раздела "education" (201-299)
  const educationTopics = allTopics
    .filter(t => t.section === 'education')
    .sort((a, b) => (a.order || a.topic_number) - (b.order || b.topic_number))
  
  const currentIndex = educationTopics.findIndex(t => t.topic_number === topicNumber)
  const prevTopic = currentIndex > 0 ? educationTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < educationTopics.length - 1 ? educationTopics[currentIndex + 1] : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Навигация */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/education"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <Home className="w-4 h-4 mr-2" />
              Назад к разделу "Образование"
            </Link>
            
            <div className="text-sm text-gray-500">
              Тема {topic.topic_number} из {educationTopics.length}
            </div>
          </div>

          {/* Навигация по темам */}
          <div className="flex justify-between mb-6">
            {prevTopic ? (
              <Link
                href={`/topics/education/${prevTopic.topic_number}`}
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
                href={`/topics/education/${nextTopic.topic_number}`}
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
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 bg-opacity-10">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            <span className="font-medium bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Раздел: Образование
            </span>
          </div>
        </div>

        {/* Заголовок темы */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-lg flex items-center justify-center font-bold text-lg mr-4">
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
              Изучите все {educationTopics.length} тем по Образованию
            </div>
            
            <div className="flex gap-3">
              {prevTopic && (
                <Link
                  href={`/topics/education/${prevTopic.topic_number}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Назад
                </Link>
              )}
              
              <Link
                href="/education"
                className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Все темы раздела
              </Link>
              
              {nextTopic && (
                <Link
                  href={`/topics/education/${nextTopic.topic_number}`}
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