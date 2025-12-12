// app/lib/cms/server.ts - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
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

// Конфигурация для разных окружений
const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  timeout: 10000, // 10 секунд
  retryCount: 2
}

// Кэш в памяти для предотвращения дублирующих запросов
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1 минута

// Улучшенная функция fetch с кэшированием
async function cachedFetch(url: string, options: RequestInit = {}) {
  const cacheKey = `${url}-${JSON.stringify(options)}`
  const now = Date.now()
  
  // Проверяем кэш
  const cached = cache.get(cacheKey)
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache hit: ${url}`)
    return cached.data
  }
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Сохраняем в кэш
    cache.set(cacheKey, { data, timestamp: now })
    
    return data
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error)
    throw error
  }
}

// Параллельная загрузка всех разделов
export async function getAllTopics(): Promise<Topic[]> {
  const sections = ['fires', 'emergency', 'education', 'protection']
  
  try {
    // Создаем промисы для всех разделов
    const promises = sections.map(async (section) => {
      try {
        const apiUrl = `${config.baseUrl}/api/github/topics?section=${section}`
        const topics = await cachedFetch(apiUrl, {
          // ВАЖНО: используем force-cache в production для скорости
          cache: config.isDevelopment ? 'no-store' : 'force-cache',
          next: { revalidate: 3600 } // 1 час для production
        })
        
        return topics.map((topic: any) => ({
          ...topic,
          content: topic.content || topic.body || '',
          body: topic.body || topic.content || '',
          section: topic.section || section
        }))
      } catch (error) {
        console.warn(`⚠️ Failed to load section ${section}:`, error)
        return [] // Возвращаем пустой массив при ошибке
      }
    })
    
    // Запускаем все запросы параллельно
    const results = await Promise.allSettled(promises)
    
    // Объединяем все темы
    const allTopics: Topic[] = results.flatMap(result => 
      result.status === 'fulfilled' ? result.value : []
    )
    
    // Сортируем темы
    return allTopics.sort((a, b) => {
      const sectionOrder = ['fires', 'emergency', 'education', 'protection']
      const sectionCompare = sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section)
      if (sectionCompare !== 0) return sectionCompare
      return (a.order || 0) - (b.order || 0)
    })
    
  } catch (error) {
    console.error('❌ Error in getAllTopics:', error)
    return []
  }
}

export async function getTopicByNumber(number: number): Promise<Topic | null> {
  try {
    const topics = await getAllTopics()
    return topics.find(topic => topic.topic_number === number) || null
  } catch (error) {
    console.error('Error getting topic by number:', error)
    return null
  }
}

export async function getTopicsBySection(section: string): Promise<Topic[]> {
  try {
    const apiUrl = `${config.baseUrl}/api/github/topics?section=${section}`
    const topics = await cachedFetch(apiUrl, {
      cache: config.isDevelopment ? 'no-store' : 'force-cache',
      next: { revalidate: 3600 } // 1 час для production
    })
    
    return topics.map((topic: any) => ({
      ...topic,
      content: topic.content || topic.body || '',
      body: topic.body || topic.content || '',
      section: topic.section || section
    }))
  } catch (error) {
    console.error(`Error loading topics for section ${section}:`, error)
    return []
  }
}

export async function getTopicById(id: number): Promise<Topic | null> {
  try {
    const topics = await getAllTopics()
    return topics.find(topic => topic.id === id) || null
  } catch (error) {
    console.error('Error getting topic by id:', error)
    return null
  }
}