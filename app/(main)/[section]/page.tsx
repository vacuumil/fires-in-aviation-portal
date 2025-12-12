// app/(main)/[section]/page.tsx - ТОЛЬКО СЕРВЕРНЫЙ КОМПОНЕНТ БЕЗ БЛОКА ОБНОВЛЕНИЯ
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

// Настройки ревалидации
export const revalidate = 60

// Генерация метаданных
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const resolvedParams = await params
  const currentSection = resolvedParams.section
  const config = sectionConfig[currentSection as keyof typeof sectionConfig]
  
  if (!config) {
    return {
      title: 'Раздел не найден',
      description: 'Запрошенный раздел не существует'
    }
  }
  
  return {
    title: `${config.title} | Безопасность в авиации`,
    description: config.description,
    keywords: currentSection === 'fires' ? 'пожары, безопасность, авиация, обучение' : 
              currentSection === 'emergency' ? 'чрезвычайные ситуации, аварии, спасение' :
              currentSection === 'education' ? 'образование, обучение, методики' :
              'защита, безопасность, средства защиты'
  }
}

export default async function SectionPage({ 
  params 
}: { 
  params: Promise<{ section: string }> 
}) {
  const resolvedParams = await params
  const currentSection = resolvedParams.section
  const config = sectionConfig[currentSection as keyof typeof sectionConfig]
  
  if (!config) {
    notFound()
  }
  
  // Загружаем темы раздела
  const topics = await getTopicsBySection(currentSection)
  
  console.log(`📊 Section ${currentSection} loaded ${topics.length} topics`)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок раздела */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className={`w-20 h-20 rounded-2xl bg-linear-to-r ${config.linear} flex items-center justify-center shadow-lg`}>
            <div className="text-white">
              {config.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{config.title}</h1>
                <p className="text-gray-600 text-lg md:text-xl">{config.description}</p>
              </div>
              <div className="bg-linear-to-r from-gray-50 to-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Всего тем в разделе</p>
                <p className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {topics.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список тем */}
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic: any) => (
              <Link
                key={topic.topic_number}
                href={`/topics/${topic.topic_number}`}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-r ${config.linear} bg-opacity-10 flex items-center justify-center font-bold mr-4`}>
                    <span className={`text-xl font-bold bg-linear-to-r ${config.linear} bg-clip-text text-transparent`}>
                      {topic.topic_number}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                    {topic.title}
                  </h2>
                </div>
                
                {topic.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{topic.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                  <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                    Открыть тему
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
                
                {topic.keywords && topic.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {topic.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                      <span 
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200"
                      >
                        {keyword}
                      </span>
                    ))}
                    {topic.keywords.length > 3 && (
                      <span className="text-xs text-gray-400 px-2 py-1">
                        +{topic.keywords.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-r from-blue-100 to-cyan-100 mb-6 shadow-sm">
              <div className="text-blue-600">
                {config.icon}
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-blue-800 mb-3">Раздел в разработке</h3>
            <p className="text-blue-700 text-lg mb-6 max-w-2xl mx-auto">
              Преподаватель еще не добавил материалы в этот раздел. Темы будут доступны после добавления через админ-панель.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors border border-blue-200"
              >
                <span>На главную страницу</span>
              </Link>
              <Link 
                href="/admin/simple" 
                className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <span>Перейти в админ-панель</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        )}
        
        {/* Блок с информацией - БЕЗ КНОПКИ ОБНОВЛЕНИЯ */}
        {topics.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Контент обновляется автоматически</h3>
                  <p className="text-gray-600 text-sm">
                    Новые темы появятся на этой странице в течение нескольких минут после их создания.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300 text-sm whitespace-nowrap"
                >
                  ← На главную страницу
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}