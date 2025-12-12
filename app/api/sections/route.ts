// app/api/sections/[section]/route.ts - ПРОКСИ ДЛЯ GitHub API
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params
    
    // Проксируем запрос к GitHub API
    const response = await fetch(
      `${request.nextUrl.origin}/api/github/topics?section=${section}`,
      {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    )
    
    if (!response.ok) {
      return NextResponse.json([], { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error in sections API:', error)
    return NextResponse.json([], { status: 500 })
  }
}