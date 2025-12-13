// app/api/github/topics/stats/route.ts - API для статистики
import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'vacuumil'
const GITHUB_REPO = process.env.GITHUB_REPO || 'fires-in-aviation-portal'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section')
    
    // Если запрошена статистика
    if (section === 'stats') {
      const sections = ['fires', 'emergency', 'education', 'protection']
      const stats: Record<string, number> = {}
      
      // Получаем статистику для всех разделов
      for (const sec of sections) {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/app/content/${sec}`,
            {
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
              },
              next: { revalidate: 3600 } // Кэшируем на 1 час
            }
          )
          
          if (response.ok) {
            const files = await response.json()
            if (Array.isArray(files)) {
              stats[sec] = files.filter((f: any) => f.name.endsWith('.md')).length
            } else {
              stats[sec] = 0
            }
          } else {
            stats[sec] = 0
          }
        } catch (error) {
          stats[sec] = 0
        }
      }
      
      return NextResponse.json(stats)
    }
    
    // Если запрошен конкретный раздел
    if (section) {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/app/content/${section}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )
      
      if (!response.ok) {
        return NextResponse.json([])
      }
      
      const files = await response.json()
      const count = Array.isArray(files) 
        ? files.filter((f: any) => f.name.endsWith('.md')).length 
        : 0
      
      return NextResponse.json({ count })
    }
    
    return NextResponse.json({ error: 'Section parameter required' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in stats API:', error)
    return NextResponse.json({ 
      fires: 26,
      emergency: 0,
      education: 0,
      protection: 0
    })
  }
}