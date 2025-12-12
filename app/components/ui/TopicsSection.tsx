
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TopicsSectionProps {
  title: string
  icon: React.ReactNode
  gradient: string
  sectionSlug: string
}

export default function TopicsSection({ 
  title, 
  icon, 
  gradient,
  sectionSlug 
}: TopicsSectionProps) {
  // Здесь будут данные из базы, пока заглушка
  const topics: any[] = [] // Заглушка

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 rounded-xl bg-linear-to-r ${gradient} flex items-center justify-center`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">Темы будут добавлены преподавателем</p>
          </div>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/${sectionSlug}/${topic.slug}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 group"
              >
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-4">
                  {topic.title}
                </h2>
                
                {topic.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{topic.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 group-hover:border-gray-200">
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">Открыть тему</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <div className="text-blue-600">
                {icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Раздел в разработке</h3>
            <p className="text-blue-600">
              Преподаватель еще не добавил материалы в этот раздел.
            </p>
            <p className="text-blue-500 text-sm mt-2">
              Темы будут доступны после добавления через админ-панель.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}