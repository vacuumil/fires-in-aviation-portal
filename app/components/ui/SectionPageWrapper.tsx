// app/components/ui/SectionPageWrapper.tsx
interface SectionPageWrapperProps {
  section: string
  title: string
  icon: React.ReactNode
  gradient: string
  description: string
}

export default async function SectionPageWrapper({
  section,
  title,
  icon,
  gradient,
  description
}: SectionPageWrapperProps) {
  // Загружаем темы раздела из API
  let topics = []
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/sections/${section}`, {
      next: { revalidate: 60 }
    })
    
    if (response.ok) {
      topics = await response.json()
    }
  } catch (error) {
    console.error(`Error loading topics for ${section}:`, error)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок раздела */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 rounded-xl bg-linear-to-r ${gradient} flex items-center justify-center`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {topics.length} {topics.length === 1 ? 'тема' : topics.length % 10 >= 2 && topics.length % 10 <= 4 && (topics.length % 100 < 10 || topics.length % 100 > 20) ? 'темы' : 'тем'}
            </p>
          </div>
        </div>

        {/* Список тем */}
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic: any) => (
              <a
                key={topic.topic_number}
                href={`/topics/${section}/${topic.topic_number}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 group block"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-linear-to-r ${gradient} bg-opacity-10 flex items-center justify-center font-bold mr-3`}>
                    <span className={`bg-linear-to-r ${gradient} bg-clip-text text-transparent`}>
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
                  <span className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </a>
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
          </div>
        )}
      </div>
    </div>
  )
}