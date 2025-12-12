// app/api/sections/[section]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params
    const validSections = ['fires', 'emergency', 'education', 'protection']
    
    if (!validSections.includes(section)) {
      return NextResponse.json([], { status: 404 })
    }
    
    const sectionDir = path.join(process.cwd(), 'app/content', section)
    
    // Если папка не существует, возвращаем пустой массив
    if (!fs.existsSync(sectionDir)) {
      return NextResponse.json([])
    }
    
    // Читаем все MD файлы в папке
    const files = fs.readdirSync(sectionDir)
      .filter(f => f.endsWith('.md'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('topic-', '').replace('.md', '')) || 0
        const numB = parseInt(b.replace('topic-', '').replace('.md', '')) || 0
        return numA - numB
      })
    
    const topics = files.map(file => {
      try {
        const filePath = path.join(sectionDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContent)
        
        const match = file.match(/topic-(\d+)\.md/)
        const topicNumber = match ? parseInt(match[1]) : data.topic_number
        
        // ВАЖНО: Проверяем, что тема принадлежит текущему разделу
        if (data.section !== section) {
          return null // Пропускаем темы из других разделов
        }
        
        // Нормализуем keywords
        let keywords: string[] = []
        if (data.keywords) {
          if (Array.isArray(data.keywords)) {
            keywords = data.keywords
          } else if (typeof data.keywords === 'string') {
            keywords = data.keywords.split(',').map(k => k.trim()).filter(k => k)
          }
        }
        
        return {
          id: topicNumber,
          topic_number: topicNumber,
          title: data.title || `Тема ${topicNumber}`,
          description: data.description || '',
          content: content,
          body: content,
          date: data.date || new Date().toISOString().split('T')[0],
          author: data.author || 'Преподаватель',
          keywords: keywords,
          section: section, // Убеждаемся, что section правильный
          order: data.order || topicNumber
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error)
        return null
      }
    }).filter(topic => topic !== null)
    
    topics.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    
    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error reading section topics:', error)
    return NextResponse.json([], { status: 500 })
  }
}