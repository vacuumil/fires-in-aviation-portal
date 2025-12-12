// app/lib/cms/server.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ СБОРКИ
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

// Мок-данные для сборки
const mockTopicsBySection: Record<string, Topic[]> = {
  fires: [
    {
      id: 1,
      topic_number: 1,
      title: "теория 1",
      description: "для пробы",
      content: "# Новая тема\n\n**Начните писать содержание темы здесь...**\n",
      body: "# Новая тема\n\n**Начните писать содержание темы здесь...**\n",
      date: "2025-12-11",
      author: "Преподаватель",
      keywords: ["ура"],
      section: "fires",
      order: 1
    },
    {
      id: 2,
      topic_number: 2,
      title: "Статистика пожаров в авиации",
      description: "Анализ статистических данных по пожарам в авиации за последние годы",
      content: "# Статистика пожаров в авиации\n\n## Анализ данных\n\nСовременная статистика пожаров в авиации показывает определенные тенденции и закономерности.",
      body: "# Статистика пожаров в авиации\n\n## Анализ данных\n\nСовременная статистика пожаров в авиации показывает определенные тенденции и закономерности.",
      date: "2024-01-15",
      author: "Преподаватель",
      keywords: [],
      section: "fires",
      order: 2
    }
  ],
  emergency: [
    {
      id: 101,
      topic_number: 101,
      title: "ЧС",
      description: "ситуация",
      content: "# Новая тема\n\n**Начните писать содержание темы здесь...\n**",
      body: "# Новая тема\n\n**Начните писать содержание темы здесь...\n**",
      date: "2025-12-11",
      author: "я",
      keywords: ["чситуация"],
      section: "emergency",
      order: 1
    }
  ],
  education: [],
  protection: []
}

// Функция для определения режима
function isBuildTime() {
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         process.env.NODE_ENV === 'production'
}

export async function getAllTopics(): Promise<Topic[]> {
  // Если время сборки, возвращаем мок-данные
  if (isBuildTime()) {
    console.log('📦 Build time: using mock data')
    const allTopics: Topic[] = []
    Object.values(mockTopicsBySection).forEach(topics => {
      allTopics.push(...topics)
    })
    return allTopics
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const sections = ['fires', 'emergency', 'education', 'protection']
    
    const allTopics: Topic[] = []
    
    for (const section of sections) {
      try {
        // Используем абсолютный URL для продакшена
        const apiUrl = `${baseUrl}/api/github/topics?section=${section}`
        const response = await fetch(apiUrl, {
          next: { revalidate: 60 }
        })
        
        if (response.ok) {
          const topics = await response.json()
          allTopics.push(...topics)
        } else {
          console.warn(`Не удалось загрузить темы для раздела ${section}:`, response.status)
        }
      } catch (error) {
        console.error(`Error loading topics for ${section}:`, error)
      }
    }
    
    return allTopics.sort((a, b) => {
      const sectionOrder = ['fires', 'emergency', 'education', 'protection']
      const sectionCompare = sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section)
      if (sectionCompare !== 0) return sectionCompare
      return (a.order || 0) - (b.order || 0)
    })
    
  } catch (error) {
    console.error('Error reading all topics:', error)
    return []
  }
}

export async function getTopicByNumber(number: number, section?: string): Promise<Topic | null> {
  try {
    const topics = await getAllTopics()
    
    if (section) {
      return topics.find(topic => topic.topic_number === number && topic.section === section) || null
    }
    
    return topics.find(topic => topic.topic_number === number) || null
  } catch (error) {
    console.error('Error getting topic by number:', error)
    return null
  }
}

export async function getTopicsBySection(section: string): Promise<Topic[]> {
  // Если время сборки, возвращаем мок-данные
  if (isBuildTime()) {
    return mockTopicsBySection[section] || []
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/github/topics?section=${section}`
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 }
    })
    
    if (response.ok) {
      return await response.json()
    }
    console.warn(`Failed to load topics for section ${section}:`, response.status)
    return []
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