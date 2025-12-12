// app/api/topics/simple/route.ts - ПРОСТОЙ API ДЛЯ АДМИНКИ
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const contentDir = path.join(process.cwd(), 'app/content')

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section')
    
    const allTopics: any[] = []
    const sections = ['fires', 'emergency', 'education', 'protection']
    
    for (const sectionDir of sections) {
      const sectionPath = path.join(contentDir, sectionDir)
      
      if (!fs.existsSync(sectionPath)) continue
      
      const files = fs.readdirSync(sectionPath)
        .filter(f => f.endsWith('.md'))
        .map(file => {
          try {
            const filePath = path.join(sectionPath, file)
            const content = fs.readFileSync(filePath, 'utf8')
            
            // Простой парсинг frontmatter
            const lines = content.split('\n')
            const metadata: any = {}
            let body = ''
            let inFrontmatter = false
            
            for (const line of lines) {
              const trimmed = line.trim()
              
              if (trimmed === '---') {
                if (!inFrontmatter) {
                  inFrontmatter = true
                } else {
                  inFrontmatter = false
                }
                continue
              }
              
              if (inFrontmatter) {
                const match = trimmed.match(/^([^:]+):\s*(.+)$/)
                if (match) {
                  const [, key, value] = match
                  metadata[key.trim()] = value.trim().replace(/^['"](.*)['"]$/, '$1')
                }
              } else {
                body += line + '\n'
              }
            }
            
            const match = file.match(/topic-(\d+)\.md/)
            const topicNumber = match ? parseInt(match[1]) : metadata.topic_number
            
            return {
              id: topicNumber,
              topic_number: topicNumber,
              title: metadata.title || `Тема ${topicNumber}`,
              description: metadata.description || '',
              content: body.trim(),
              body: body.trim(),
              date: metadata.date || new Date().toISOString().split('T')[0],
              author: metadata.author || 'Преподаватель',
              keywords: metadata.keywords ? 
                (Array.isArray(metadata.keywords) ? metadata.keywords : 
                 typeof metadata.keywords === 'string' ? metadata.keywords.split(',').map((k: string) => k.trim()) : []) : [],
              section: sectionDir,
              order: metadata.order || topicNumber
            }
          } catch (error) {
            console.error(`Error reading ${file}:`, error)
            return null
          }
        })
        .filter(Boolean)
      
      allTopics.push(...files)
    }
    
    if (section) {
      const filtered = allTopics.filter(topic => topic.section === section)
      return NextResponse.json(filtered)
    }
    
    return NextResponse.json(allTopics)
    
  } catch (error) {
    console.error('Error in simple topics API:', error)
    return NextResponse.json([], { status: 500 })
  }
}