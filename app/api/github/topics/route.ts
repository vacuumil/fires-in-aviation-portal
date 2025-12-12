// app/api/github/topics/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'vacuumil'
const GITHUB_REPO = process.env.GITHUB_REPO || 'fires-in-aviation-portal'

// Оптимизированная функция для GitHub API
async function githubRequest(endpoint: string, options: RequestInit = {}) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured')
  }
  
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/${endpoint}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Fires-in-Aviation-App',
        ...options.headers,
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorText = await response.text().catch(() => 'No error body')
      throw new Error(`GitHub API error (${response.status}): ${errorText}`)
    }
    
    return response.json()
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      console.warn(`GitHub API timeout: ${endpoint}`)
      return null
    }
    
    console.error(`GitHub API error for ${endpoint}:`, error.message)
    return null
  }
}

// Получить список тем раздела
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section') || 'fires'
    
    console.log(`📡 Loading topics for section: ${section}`)
    
    // Получаем список файлов из папки content/{section} на GitHub
    const files = await githubRequest(`contents/app/content/${section}`)
    
    if (!files || !Array.isArray(files)) {
      console.log(`📁 Folder ${section} not found or empty`)
      return NextResponse.json([])
    }
    
    // Обработка файлов
    const topicsPromises = files
      .filter((file: any) => file.name.endsWith('.md'))
      .map(async (file: any) => {
        try {
          // Получаем содержимое файла
          const fileData = await githubRequest(`contents/app/content/${section}/${file.name}`)
          if (!fileData || !fileData.content) {
            return null
          }
          
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
          
          // Парсим frontmatter
          const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
          if (!frontmatterMatch) {
            return null
          }
          
          const frontmatter = frontmatterMatch[1]
          const body = frontmatterMatch[2].trim()
          
          // Парсим ключи frontmatter
          const metadata: Record<string, any> = {}
          frontmatter.split('\n').forEach(line => {
            const trimmedLine = line.trim()
            if (!trimmedLine) return
            
            const match = trimmedLine.match(/^([^:]+):\s*(.+)$/)
            if (match) {
              const [, key, value] = match
              const cleanKey = key.trim()
              const cleanValue = value.trim()
              
              try {
                metadata[cleanKey] = JSON.parse(cleanValue)
              } catch {
                const unquotedValue = cleanValue.replace(/^['"](.*)['"]$/, '$1')
                metadata[cleanKey] = unquotedValue
              }
            }
          })
          
          // Извлекаем номер темы
          const topicNumber = parseInt(file.name.replace('topic-', '').replace('.md', ''))
          if (isNaN(topicNumber)) {
            return null
          }
          
          // Нормализуем keywords
          let keywords: string[] = []
          if (metadata.keywords) {
            if (Array.isArray(metadata.keywords)) {
              keywords = metadata.keywords
            } else if (typeof metadata.keywords === 'string') {
              keywords = metadata.keywords.split(',').map(k => k.trim()).filter(k => k)
            }
          }
          
          return {
            id: topicNumber,
            topic_number: topicNumber,
            title: metadata.title || `Тема ${topicNumber}`,
            description: metadata.description || '',
            content: body,
            body: body,
            date: metadata.date || new Date().toISOString().split('T')[0],
            author: metadata.author || 'Преподаватель',
            keywords: keywords,
            section: metadata.section || section,
            order: metadata.order || topicNumber,
          }
        } catch (error) {
          return null
        }
      })
    
    const topics = await Promise.all(topicsPromises)
    
    // Фильтруем и сортируем
    const filteredTopics = topics.filter(topic => topic !== null) as any[]
    filteredTopics.sort((a, b) => (a.order || 0) - (b.order || 0))
    
    console.log(`✅ Loaded ${filteredTopics.length} topics for section ${section}`)
    return NextResponse.json(filteredTopics)
    
  } catch (error: any) {
    console.error('Error in GitHub topics API:', error.message)
    return NextResponse.json([])
  }
}

// Создать или обновить тему
export async function POST(request: NextRequest) {
  try {
    // Клонируем запрос для безопасного чтения
    const requestClone = request.clone()
    const body = await requestClone.json()
    
    const {
      topic_number,
      title,
      description,
      content,
      date,
      author,
      keywords = [],
      section = 'fires',
      order
    } = body
    
    // Валидация
    if (!topic_number || !title) {
      return NextResponse.json(
        { error: 'Необходимы номер темы и заголовок' },
        { status: 400 }
      )
    }
    
    const topicNumber = parseInt(topic_number.toString())
    if (isNaN(topicNumber) || topicNumber <= 0) {
      return NextResponse.json(
        { error: 'Номер темы должен быть положительным числом' },
        { status: 400 }
      )
    }
    
    // Формируем содержание файла
    const frontmatter = `---
topic_number: ${topicNumber}
title: "${title.replace(/"/g, '\\"')}"
description: "${description ? description.replace(/"/g, '\\"') : ''}"
date: "${date || new Date().toISOString().split('T')[0]}"
author: "${author || 'Преподаватель'}"
keywords:
${Array.isArray(keywords) ? keywords.map((k: string) => `  - "${k.replace(/"/g, '\\"')}"`).join('\n') : '  []'}
section: "${section}"
order: ${order || topicNumber}
---

${content || `# ${title}\n\nНачните писать содержание темы здесь...`}`
    
    const fileName = `topic-${topicNumber}.md`
    const filePath = `app/content/${section}/${fileName}`
    
    console.log(`💾 Saving topic ${topicNumber} in ${section}`)
    
    // Проверяем, существует ли файл
    let sha: string | undefined
    try {
      const existingFile = await githubRequest(`contents/${filePath}`)
      if (existingFile && existingFile.sha) {
        sha = existingFile.sha
      }
    } catch (error) {
      // Файл не существует
    }
    
    // Подготавливаем тело запроса
    const requestBody: any = {
      message: sha ? `Updated topic ${topicNumber}` : `Created topic ${topicNumber}`,
      content: Buffer.from(frontmatter).toString('base64')
    }
    
    // Добавляем SHA если файл существует
    if (sha) {
      requestBody.sha = sha
    }
    
    // Сохраняем файл на GitHub
    const githubResponse = await githubRequest(`contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody)
    })
    
    if (!githubResponse) {
      throw new Error('GitHub API returned no response')
    }
    
    // Формируем ответ
    const topicData = {
      id: topicNumber,
      topic_number: topicNumber,
      title: title,
      description: description || '',
      content: content || '',
      body: content || '',
      date: date || new Date().toISOString().split('T')[0],
      author: author || 'Преподаватель',
      keywords: Array.isArray(keywords) ? keywords : [],
      section: section,
      order: order || topicNumber,
    }
    
    return NextResponse.json({
      success: true,
      message: sha ? `Тема ${topicNumber} обновлена` : `Тема ${topicNumber} создана`,
      topic: topicData
    })
    
  } catch (error: any) {
    console.error('Error saving topic to GitHub:', error.message)
    return NextResponse.json(
      { 
        error: 'Ошибка сохранения темы: ' + error.message
      },
      { status: 500 }
    )
  }
}

// Удалить тему
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section') || 'fires'
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Не указан ID темы' },
        { status: 400 }
      )
    }
    
    const topicNumber = parseInt(id)
    if (isNaN(topicNumber)) {
      return NextResponse.json(
        { error: 'Неверный формат ID темы' },
        { status: 400 }
      )
    }
    
    const fileName = `topic-${topicNumber}.md`
    const filePath = `app/content/${section}/${fileName}`
    
    console.log(`🗑️ Deleting topic ${topicNumber} from ${section}`)
    
    // Получаем SHA файла для удаления
    const fileInfo = await githubRequest(`contents/${filePath}`)
    
    if (!fileInfo || !fileInfo.sha) {
      return NextResponse.json(
        { error: 'Тема не найдена' },
        { status: 404 }
      )
    }
    
    // Удаляем файл на GitHub
    await githubRequest(`contents/${filePath}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Deleted topic ${topicNumber}`,
        sha: fileInfo.sha
      })
    })
    
    return NextResponse.json({
      success: true,
      message: `Тема ${topicNumber} удалена`
    })
    
  } catch (error: any) {
    console.error('Error deleting topic from GitHub:', error.message)
    return NextResponse.json(
      { error: 'Ошибка удаления темы: ' + error.message },
      { status: 500 }
    )
  }
}