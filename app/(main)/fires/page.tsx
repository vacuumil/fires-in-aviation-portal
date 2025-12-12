// app/(main)/fires/page.tsx - ИСПРАВЛЕННЫЙ
import { getAllTopics } from '@/app/lib/cms/server'
import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'

export default async function FiresPage() {
  const topics = await getAllTopics()
  
  // Фильтруем только темы раздела "fires"
  const fireTopics = topics
    .filter(topic => topic.section === 'fires')
    .sort((a, b) => (a.order || a.topic_number) - (b.order || b.topic_number))

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-xl bg-linear-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Пожары в авиации</h1>
            <p className="text-gray-600 mt-2">Темы по пожарной безопасности</p>
            <p className="text-sm text-gray-500 mt-1">
              {fireTopics.length} {fireTopics.length === 1 ? 'тема' : 'тем'}
            </p>
          </div>
        </div>

        {fireTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fireTopics.map((topic) => (
              <Link
                key={topic.topic_number}
                href={`/topics/${topic.topic_number}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 text-red-800 rounded-lg flex items-center justify-center font-bold mr-3">
                    {topic.topic_number}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    {topic.title}
                  </h2>
                </div>
                
                {topic.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{topic.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 group-hover:border-gray-200">
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">Открыть тему</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Раздел в разработке</h3>
            <p className="text-blue-600">
              Темы по пожарной безопасности будут добавлены преподавателем.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}