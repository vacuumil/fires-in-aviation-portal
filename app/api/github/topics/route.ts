// app/api/github/topics/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'vacuumil'
const GITHUB_REPO = process.env.GITHUB_REPO || 'fires-in-aviation-portal'

// Вспомогательная функция для работы с GitHub API
async function githubRequest(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/${endpoint}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 секунд таймаут
  
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
        throw new Error('NOT_FOUND')
      }
      const errorText = await response.text()
      throw new Error(`GitHub API error (${response.status}): ${errorText}`)
    }
    
    return response.json()
  } catch (error: unknown) {
    clearTimeout(timeoutId)
    
    // Проверяем тип ошибки
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('GitHub API timeout after 8 seconds')
      }
      if (error.message === 'NOT_FOUND') {
        throw error
      }
      throw new Error(`GitHub API request failed: ${error.message}`)
    }
    
    // Если error не является экземпляром Error
    throw new Error(`GitHub API request failed: ${String(error)}`)
  }
}

// Получить список тем раздела
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section') || 'fires'
    
    console.log(`📡 Загрузка тем для раздела: ${section}`)
    
    try {
      // Получаем список файлов из папки content/{section} на GitHub
      const files = await githubRequest(`contents/app/content/${section}`)
      
      const topics = await Promise.all(
        files
          .filter((file: any) => file.name.endsWith('.md'))
          .map(async (file: any) => {
            try {
              // Получаем содержимое файла
              const fileData = await githubRequest(`contents/app/content/${section}/${file.name}`)
              const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
              
              // Парсим frontmatter
              const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
              let metadata: any = {}
              let body = ''
              
              if (frontmatterMatch) {
                const frontmatter = frontmatterMatch[1]
                body = frontmatterMatch[2]
                
                // Парсим ключи frontmatter
                frontmatter.split('\n').forEach(line => {
                  const match = line.match(/^([^:]+):\s*(.+)$/)
                  if (match) {
                    const [, key, value] = match
                    try {
                      // Пробуем распарсить JSON (для массивов)
                      metadata[key.trim()] = JSON.parse(value)
                    } catch {
                      // Если не JSON, убираем кавычки
                      const cleanValue = value.trim()
                        .replace(/^['"](.*)['"]$/, '$1')
                      metadata[key.trim()] = cleanValue
                    }
                  }
                })
              }
              
              // Извлекаем номер темы из имени файла
              const topicNumber = parseInt(file.name.replace('topic-', '').replace('.md', ''))
              
              return {
                id: topicNumber,
                topic_number: topicNumber,
                title: metadata.title || `Тема ${topicNumber}`,
                description: metadata.description || '',
                content: body,
                body: body,
                date: metadata.date || new Date().toISOString().split('T')[0],
                author: metadata.author || 'Преподаватель',
                keywords: Array.isArray(metadata.keywords) ? metadata.keywords : 
                         typeof metadata.keywords === 'string' ? [metadata.keywords] : [],
                section: metadata.section || section,
                order: metadata.order || topicNumber,
                path: file.path,
                sha: fileData.sha
              }
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : String(error)
              console.error(`Error processing file ${file.name}:`, errorMessage)
              return null
            }
          })
      )
      
      // Фильтруем null значения и сортируем темы
      const filteredTopics = topics.filter(topic => topic !== null)
      filteredTopics.sort((a, b) => (a.order || 0) - (b.order || 0))
      
      console.log(`✅ Загружено ${filteredTopics.length} тем для раздела ${section}`)
      return NextResponse.json(filteredTopics)
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage === 'NOT_FOUND') {
        console.log(`📁 Папка раздела ${section} не найдена, возвращаем пустой массив`)
        return NextResponse.json([])
      }
      
      console.error(`Error accessing GitHub for section ${section}:`, errorMessage)
      throw error
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error fetching topics from GitHub:', errorMessage)
    
    // Возвращаем пустой массив при ошибках
    return NextResponse.json([], { status: 200 })
  }
}

// Создать или обновить тему
export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token is not configured')
    }
    
    const body = await request.json()
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
    
    console.log(`💾 Сохранение темы ${topicNumber} в ${section}`)
    
    // Проверяем, существует ли файл
    let sha: string | undefined
    try {
      const existingFile = await githubRequest(`contents/${filePath}`)
      sha = existingFile.sha
      // ИСПРАВЛЕНО: проверка на undefined
      if (sha) {
        console.log(`📄 Файл существует, обновляем (SHA: ${sha.substring(0, 8)}...)`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('404') || errorMessage === 'NOT_FOUND') {
        console.log('📄 Файл не существует, создаем новый')
      } else {
        throw error
      }
    }
    
    // Подготавливаем тело запроса
    const requestBody: any = {
      message: sha ? `Обновлена тема ${topicNumber}` : `Создана тема ${topicNumber}`,
      content: Buffer.from(frontmatter).toString('base64')
    }
    
    // Добавляем SHA только если файл существует
    if (sha) {
      requestBody.sha = sha
    }
    
    // Сохраняем файл на GitHub
    const githubResponse = await githubRequest(`contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody)
    })
    
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
      path: filePath,
      sha: githubResponse.content.sha
    }
    
    return NextResponse.json({
      success: true,
      message: sha ? `Тема ${topicNumber} обновлена` : `Тема ${topicNumber} создана`,
      topic: topicData
    })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error saving topic to GitHub:', errorMessage)
    return NextResponse.json(
      { 
        error: 'Ошибка сохранения темы: ' + errorMessage
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
    const fileName = `topic-${topicNumber}.md`
    const filePath = `app/content/${section}/${fileName}`
    
    console.log(`🗑️ Удаление темы ${topicNumber} из раздела ${section}`)
    
    // Получаем SHA файла для удаления
    const fileInfo = await githubRequest(`contents/${filePath}`)
    
    // Удаляем файл на GitHub
    await githubRequest(`contents/${filePath}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Удалена тема ${topicNumber}`,
        sha: fileInfo.sha
      })
    })
    
    return NextResponse.json({
      success: true,
      message: `Тема ${topicNumber} удалена`
    })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error deleting topic from GitHub:', errorMessage)
    return NextResponse.json(
      { error: 'Ошибка удаления темы: ' + errorMessage },
      { status: 500 }
    )
  }
}