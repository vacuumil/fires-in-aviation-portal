import { NextRequest, NextResponse } from 'next/server'
import { getAllTopics } from '@/app/lib/cms/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section')
    
    const topics = await getAllTopics()
    
    if (section) {
      // Фильтруем по разделу
      const filteredTopics = topics.filter(topic => {
        // Для раздела "Пожары" - темы 1-26
        if (section === 'fires') {
          return topic.topic_number >= 1 && topic.topic_number <= 26
        }
        // Для других разделов проверяем поле section в topic
        return topic.section === section
      })
      
      return NextResponse.json(filteredTopics)
    }
    
    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json([], { status: 500 })
  }
}