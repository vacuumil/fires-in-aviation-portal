// app/api/search/route.ts - ИСПРАВЛЕННЫЙ
import { NextRequest, NextResponse } from 'next/server'
import { getAllTopics } from '@/app/lib/cms/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.toLowerCase() || ''
  
  if (!query) {
    return NextResponse.json([])
  }

  try {
    const topics = await getAllTopics()
    
    const results = topics.filter(topic => 
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      (topic.content && topic.content.toLowerCase().includes(query)) ||
      topic.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    )
    
    return NextResponse.json(results.slice(0, 10))
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json([], { status: 500 })
  }
}