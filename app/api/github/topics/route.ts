// app/api/github/topics/route.ts - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'vacuumil'
const GITHUB_REPO = process.env.GITHUB_REPO || 'fires-in-aviation-portal'

// Кэш для GitHub API запросов
const githubCache = new Map<string, { data: any, timestamp: number }>()
const GITHUB_CACHE_DURATION = 5 * 60 * 1000 // 5 минут

// Оптимизированная функция для GitHub API
async function githubRequest(endpoint: string, options: RequestInit = {}, useCache = true) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured')
  }
  
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`
  const now = Date.now()
  
  // Проверяем кэш
  if (useCache) {
    const cached = githubCache.get(cacheKey)
    if (cached && now - cached.timestamp < GITHUB_CACHE_DURATION) {
      console.log(`📦 GitHub cache hit: ${endpoint}`)
      return cached.data
    }
  }
  
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/${endpoint}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 секунд таймаут
  
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
        return null // Возвращаем null вместо ошибки
      }
      const errorText = await response.text().catch(() => 'No error body')
      throw new Error(`GitHub API error (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    // Сохраняем в кэш
    if (useCache) {
      githubCache.set(cacheKey, { data, timestamp: now })
    }
    
    return data
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      console.warn(`GitHub API timeout: ${endpoint}`)
      return null // Возвращаем null при таймауте
    }
    
    console.error(`GitHub API error for ${endpoint}:`, error.message)
    return null // Возвращаем null при ошибке
  }
}

// Получить список тем раздела
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section') || 'fires'
    
    // Устанавливаем заголовки кэширования
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      'CDN-Cache-Control': 'public, s-maxage=3600',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=3600'
    }
    
    console.log(`📡 Loading topics for section: ${section}`)
    
    // Получаем список файлов из папки content/{section} на GitHub
    const files = await githubRequest(`contents/app/content/${section}`)
    
    if (!files || !Array.isArray(files)) {
      console.log(`📁 Folder ${section} not found or empty, returning empty array`)
      return NextResponse.json([], { headers })
    }
    
    // Параллельная обработка файлов
    const topicsPromises = files
      .filter((file: any) => file.name.endsWith('.md'))
      .slice(0, 100) // Ограничиваем максимум 100 файлов
      .map(async (file: any) => {
        try {
          // Получаем содержимое файла
          const fileData = await githubRequest(`contents/app/content/${section}/${file.name}`, {}, false)
          if (!fileData || !fileData.content) {
            console.warn(`File ${file.name} has no content`)
            return null
          }
          
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
          
          // Парсим frontmatter
          const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
          if (!frontmatterMatch) {
            console.warn(`File ${file.name} has invalid frontmatter`)
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
                // Пробуем распарсить JSON (для массивов)
                metadata[cleanKey] = JSON.parse(cleanValue)
              } catch {
                // Если не JSON, убираем кавычки
                const unquotedValue = cleanValue.replace(/^['"](.*)['"]$/, '$1')
                metadata[cleanKey] = unquotedValue
              }
            }
          })
          
          // Извлекаем номер темы из имени файла
          const topicNumber = parseInt(file.name.replace('topic-', '').replace('.md', ''))
          if (isNaN(topicNumber)) {
            console.warn(`Cannot extract topic number from ${file.name}`)
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
          
          const topic = {
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
            path: file.path
          }
          
          return topic
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error.message)
          return null
        }
      })
    
    const topics = await Promise.all(topicsPromises)
    
    // Фильтруем null значения и сортируем темы
    const filteredTopics = topics.filter(topic => topic !== null) as any[]
    filteredTopics.sort((a, b) => (a.order || 0) - (b.order || 0))
    
    console.log(`✅ Loaded ${filteredTopics.length} topics for section ${section}`)
    return NextResponse.json(filteredTopics, { headers })
    
  } catch (error: any) {
    console.error('Error in GitHub topics API:', error.message)
    
    // Возвращаем пустой массив с заголовками кэширования
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  }
}

// Создать или обновить тему
export async function POST(request: NextRequest) {
  try {
    // Получаем тело запроса ОДИН РАЗ
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
      const existingFile = await githubRequest(`contents/${filePath}`, {}, false)
      if (existingFile && existingFile.sha) {
        sha = existingFile.sha
        console.log(`📄 File exists, updating (SHA: ${sha?.substring(0, 8)}...)`)
      }
    } catch (error: any) {
      console.log('📄 File does not exist, creating new')
    }
    
    // Подготавливаем тело запроса
    const requestBody: any = {
      message: sha ? `Updated topic ${topicNumber}` : `Created topic ${topicNumber}`,
      content: Buffer.from(frontmatter).toString('base64')
    }
    
    // Добавляем SHA только если файл существует
    if (sha) {
      requestBody.sha = sha
    }
    
    // Очищаем кэш для этого раздела
    githubCache.clear()
    
    // Сохраняем файл на GitHub
    const githubResponse = await githubRequest(`contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody)
    }, false)
    
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
      path: filePath
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
    const fileInfo = await githubRequest(`contents/${filePath}`, {}, false)
    
    if (!fileInfo || !fileInfo.sha) {
      return NextResponse.json(
        { error: 'Тема не найдена' },
        { status: 404 }
      )
    }
    
    // Очищаем кэш
    githubCache.clear()
    
    // Удаляем файл на GitHub
    await githubRequest(`contents/${filePath}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Deleted topic ${topicNumber}`,
        sha: fileInfo.sha
      })
    }, false)
    
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