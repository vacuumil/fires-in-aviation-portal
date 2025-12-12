// app/lib/cms/server.ts - УПРОЩЕННАЯ РАБОЧАЯ ВЕРСИЯ
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

// Простая функция fetch без сложной логики
async function simpleFetch(url: string) {
  try {
    // ВАЖНО: Используем относительный путь для внутренних API
    const apiUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
    
    const response = await fetch(apiUrl, {
      // УБРАНО: cache: 'no-store'
      // Время кэширования теперь управляется на уровне страниц через revalidate
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Fetch failed for ${url}: ${response.status}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    return [];
  }
}

export async function getAllTopics(): Promise<Topic[]> {
  try {
    const baseUrl = getBaseUrl()
    const sections = ['fires', 'emergency', 'education', 'protection']
    
    const allTopics: Topic[] = []
    
    for (const section of sections) {
      const topics = await simpleFetch(`${baseUrl}/api/github/topics?section=${section}`)
      allTopics.push(...topics.map((topic: any) => ({
        ...topic,
        content: topic.content || topic.body || '',
        body: topic.body || topic.content || '',
        section: topic.section || section
      })))
    }
    
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
    const topics = await getAllTopics()
    return topics.find(topic => topic.topic_number === number) || null
  } catch (error) {
    console.error('Error getting topic by number:', error)
    return null
  }
}

export async function getTopicsBySection(section: string): Promise<Topic[]> {
  try {
    // ВАЖНО: Относительный путь к API
    const topics = await simpleFetch(`/api/github/topics?section=${section}`);
    
    return topics.map((topic: any) => ({
      ...topic,
      content: topic.content || topic.body || '',
      body: topic.body || topic.content || '',
      section: topic.section || section
    })).sort((a: Topic, b: Topic) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error(`Error loading topics for section ${section}:`, error);
    return [];
  }
}