export interface Topic {
  slug: string
  topic_number: number
  title: string
  description: string
  body: string
  image?: string
  date: string
  author: string
  keywords?: string[]
}

// Для клиента мы будем использовать API роуты
export async function searchTopics(query: string): Promise<Topic[]> {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

export async function getAllTopics(): Promise<Topic[]> {
  try {
    const response = await fetch('/api/topics')
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}