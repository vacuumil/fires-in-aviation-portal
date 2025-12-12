// app/components/ui/FooterServer.tsx
import { getTopicsBySection } from '@/app/lib/cms/server'
import FooterClient from './FooterClient'

export default async function FooterServer() {
  // Загружаем статистику на сервере
  const sections = ['fires', 'emergency', 'education', 'protection']
  
  const stats = await Promise.all(
    sections.map(async (section) => {
      const topics = await getTopicsBySection(section)
      return {
        name: section,
        count: topics.length
      }
    })
  )
  
  const total = stats.reduce((sum, section) => sum + section.count, 0)
  
  return <FooterClient stats={stats} total={total} />
}