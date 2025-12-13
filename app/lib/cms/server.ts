// app/lib/cms/server.ts - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ С КЭШИРОВАНИЕМ
export interface Topic {
  id: number
  topic_number: number
  title: string
  description: string
  content: string
  body: string
  date: string
  author: string
  keywords?: string[]
  section: string
  order: number
}

// Кэш для тем
const topicCache = new Map<string, { data: Topic[], timestamp: number }>()
const CACHE_TTL = 30000 // 30 секунд кэширования

// Базовый URL для API
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

// Улучшенная функция fetch с кэшированием
async function cachedFetch(url: string, options?: RequestInit) {
  const cacheKey = url + JSON.stringify(options || {})
  const now = Date.now()
  
  // Проверяем кэш
  const cached = topicCache.get(cacheKey)
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  try {
    const apiUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Кэширование на уровне Next.js
      ...options
    })
    
    if (!response.ok) {
      console.warn(`Fetch failed for ${url}: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    
    // Сохраняем в кэш
    topicCache.set(cacheKey, { data, timestamp: now })
    
    return data
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    return []
  }
}

export async function getAllTopics(): Promise<Topic[]> {
  try {
    const sections = ['fires', 'emergency', 'education', 'protection']
    
    // Загружаем все разделы параллельно
    const promises = sections.map(section => 
      cachedFetch(`/api/github/topics?section=${section}`)
    )
    
    const results = await Promise.all(promises)
    
    const allTopics: Topic[] = results.flat().map((topic: any) => ({
      ...topic,
      content: topic.content || topic.body || '',
      body: topic.body || topic.content || '',
      section: topic.section || 'fires'
    }))
    
    // Сортируем темы
    return allTopics.sort((a, b) => {
      const sectionOrder = ['fires', 'emergency', 'education', 'protection']
      const sectionCompare = sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section)
      if (sectionCompare !== 0) return sectionCompare
      return (a.order || 0) - (b.order || 0)
    })
    
  } catch (error) {
    console.error('Error in getAllTopics:', error)
    return []
  }
}

export async function getTopicByNumber(number: number): Promise<Topic | null> {
  try {
    // Пытаемся найти в кэше
    const cacheKey = `topic-${number}`
    const now = Date.now()
    const cached = topicCache.get(cacheKey)
    
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return Array.isArray(cached.data) ? cached.data[0] || null : cached.data as any
    }
    
    // Если нет в кэше, ищем среди всех тем
    const topics = await getAllTopics()
    const topic = topics.find(t => t.topic_number === number) || null
    
    // Сохраняем в кэш
    if (topic) {
      topicCache.set(cacheKey, { data: [topic], timestamp: now })
    }
    
    return topic
  } catch (error) {
    console.error('Error getting topic by number:', error)
    return null
  }
}

export async function getTopicsBySection(section: string): Promise<Topic[]> {
  try {
    return cachedFetch(`/api/github/topics?section=${section}`)
      .then((topics: any[]) => 
        topics.map((topic: any) => ({
          ...topic,
          content: topic.content || topic.body || '',
          body: topic.body || topic.content || '',
          section: topic.section || section
        })).sort((a: Topic, b: Topic) => (a.order || 0) - (b.order || 0))
      )
  } catch (error) {
    console.error(`Error loading topics for section ${section}:`, error)
    return []
  }
}

// Функция для очистки кэша
export function clearTopicCache() {
  topicCache.clear()
}