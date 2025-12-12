// app/(main)/[section]/page.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Flame, AlertTriangle, BookOpen, Shield } from 'lucide-react'
import { getTopicsBySection } from '@/app/lib/cms/server'


// Конфигурация разделов
const sectionConfig = {
  fires: {
    title: 'Пожары в авиации',
    description: 'Темы по пожарной безопасности',
    icon: <Flame className="w-8 h-8" />,
    linear: 'from-red-500 to-orange-500',
    color: 'from-red-500 to-orange-500',
    prefix: 1
  },
  emergency: {
    title: 'Чрезвычайные ситуации',
    description: 'Темы по действиям при ЧС в авиации',
    icon: <AlertTriangle className="w-8 h-8" />,
    linear: 'from-orange-500 to-amber-500',
    color: 'from-orange-500 to-amber-500',
    prefix: 101
  },
  education: {
    title: 'Образование',
    description: 'Учебные материалы и методики обучения',
    icon: <BookOpen className="w-8 h-8" />,
    linear: 'from-blue-500 to-cyan-500',
    color: 'from-blue-500 to-cyan-500',
    prefix: 201
  },
  protection: {
    title: 'Защита',
    description: 'Средства и методы защиты в авиации',
    icon: <Shield className="w-8 h-8" />,
    linear: 'from-green-500 to-emerald-500',
    color: 'from-green-500 to-emerald-500',
    prefix: 301
  }
}

export default async function SectionPage({ 
  params 
}: { 
  params: Promise<{ section: string }> 
}) {
  const { section } = await params
  const config = sectionConfig[section as keyof typeof sectionConfig]
  
  if (!config) {
    notFound()
  }
  
  // Загружаем темы раздела с отключенным кэшем
  const topics = await getTopicsBySection(section)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок раздела */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 rounded-xl bg-linear-to-r ${config.linear} flex items-center justify-center`}>
            <div className="text-white">
              {config.icon}
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600 mt-2">{config.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {topics.length} {topics.length === 1 ? 'тема' : 
                topics.length % 10 >= 2 && topics.length % 10 <= 4 && 
                (topics.length % 100 < 10 || topics.length % 100 > 20) ? 'темы' : 'тем'}
            </p>
          </div>
        </div>

        {/* Список тем */}
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic: any) => (
              <Link
                key={topic.topic_number}
                href={`/topics/${topic.topic_number}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 group"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-linear-to-r ${config.linear} bg-opacity-10 flex items-center justify-center font-bold mr-3`}>
                    <span className={`bg-linear-to-r ${config.linear} bg-clip-text text-transparent`}>
                      {topic.topic_number}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    {topic.title}
                  </h2>
                </div>
                
                {topic.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{topic.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 group-hover:border-gray-200">
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">
                    Открыть тему
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
                
                {topic.keywords && topic.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {topic.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                      <span 
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <div className="text-blue-600">
                {config.icon}
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