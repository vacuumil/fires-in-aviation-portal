import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Типы для тем с разделом
interface TopicData {
  topic_number: number
  title: string
  description: string
  date: string
  author: string
  body: string
  keywords?: string[]
  section?: string
  order?: number
}

const contentDirectory = path.join(process.cwd(), 'app/content')
const topicsFilePath = path.join(contentDirectory, 'topics.json')

// Создаем директорию если не существует
if (!fs.existsSync(contentDirectory)) {
  fs.mkdirSync(contentDirectory, { recursive: true })
}

// Функция для чтения всех тем
function readAllTopics(): TopicData[] {
  try {
    if (!fs.existsSync(topicsFilePath)) {
      return []
    }
    
    const data = fs.readFileSync(topicsFilePath, 'utf8')
    const topics = JSON.parse(data)
    
    // Загружаем существующие темы из Markdown файлов (для совместимости)
    const mdTopicsDir = path.join(contentDirectory, 'topics')
    if (fs.existsSync(mdTopicsDir)) {
      const mdFiles = fs.readdirSync(mdTopicsDir).filter(f => f.endsWith('.md'))
      
      mdFiles.forEach(file => {
        const match = file.match(/topic-(\d+)\.md/)
        if (match) {
          const topicNumber = parseInt(match[1])
          const filePath = path.join(mdTopicsDir, file)
          const content = fs.readFileSync(filePath, 'utf8')
          
          // Парсим frontmatter
          const lines = content.split('\n')
          let inFrontmatter = false
          const metadata: Record<string, any> = {}
          let bodyLines: string[] = []
          
          for (const line of lines) {
            const trimmedLine = line.trim()
            
            if (trimmedLine === '---') {
              if (!inFrontmatter) {
                inFrontmatter = true
              } else {
                inFrontmatter = false
              }
              continue
            }
            
            if (inFrontmatter) {
              const match = trimmedLine.match(/^([^:]+):\s*(.+)$/)
              if (match) {
                const [, key, value] = match
                let parsedValue = value.trim()
                
                if (parsedValue.startsWith('"') && parsedValue.endsWith('"')) {
                  parsedValue = parsedValue.slice(1, -1)
                } else if (parsedValue.startsWith("'") && parsedValue.endsWith("'")) {
                  parsedValue = parsedValue.slice(1, -1)
                }
                
                metadata[key.trim()] = parsedValue
              }
            } else {
              bodyLines.push(line)
            }
          }
          
          // Добавляем тему в JSON если её там нет
          const exists = topics.some((t: TopicData) => t.topic_number === topicNumber)
          if (!exists) {
            topics.push({
              topic_number: topicNumber,
              title: metadata.title || `Тема ${topicNumber}`,
              description: metadata.description || '',
              body: bodyLines.join('\n').trim(),
              date: metadata.date || new Date().toISOString().split('T')[0],
              author: metadata.author || 'Преподаватель',
              keywords: metadata.keywords || [],
              section: 'fires', // Старые темы по умолчанию в раздел "Пожары"
              order: topicNumber
            })
          }
        }
      })
    }
    
    return topics
  } catch (error) {
    console.error('Error reading topics:', error)
    return []
  }
}

// Функция для сохранения всех тем
function saveAllTopics(topics: TopicData[]) {
  try {
    // Сортируем по разделу и порядку
    topics.sort((a, b) => {
      if (a.section !== b.section) {
        const sections = ['fires', 'emergency', 'education', 'protection']
        return sections.indexOf(a.section || '') - sections.indexOf(b.section || '')
      }
      return (a.order || 0) - (b.order || 0)
    })
    
    fs.writeFileSync(topicsFilePath, JSON.stringify(topics, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error saving topics:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section')
    
    const topics = readAllTopics()
    
    if (section) {
      // Фильтруем по разделу
      const filteredTopics = topics.filter(topic => {
        // Если тема без раздела и это тема 1-26, считаем её в разделе "Пожары"
        if (!topic.section && topic.topic_number >= 1 && topic.topic_number <= 26) {
          return section === 'fires'
        }
        return topic.section === section
      })
      
      return NextResponse.json(filteredTopics)
    }
    
    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error reading topics:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// В функции POST исправляем обработку topic_number:
// В функции POST добавляем проверку:
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic_number, title, description, date, author, body: content, keywords = [], section = 'fires', order = 1 } = body

    if (!topic_number || !title) {
      return NextResponse.json(
        { error: 'Необходимы номер темы и заголовок' },
        { status: 400 }
      )
    }

    // Проверяем допустимый раздел
    const validSections = ['fires', 'emergency', 'education', 'protection']
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Неверный раздел. Допустимые значения: fires, emergency, education, protection' },
        { status: 400 }
      )
    }

    const topicNumber = parseInt(topic_number)
    if (isNaN(topicNumber) || topicNumber <= 0) {
      return NextResponse.json(
        { error: 'Номер темы должен быть положительным числом' },
        { status: 400 }
      )
    }

    // Читаем существующие темы
    const topics = readAllTopics()
    
    // Проверяем уникальность номера темы В РАЗДЕЛЕ
    const existingTopicInSection = topics.find(t => 
      t.topic_number === topicNumber && t.section === section
    )
    
    // Если тема уже существует в другом разделе с таким же номером
    const existingTopicOtherSection = topics.find(t => 
      t.topic_number === topicNumber && t.section !== section
    )
    
    if (existingTopicOtherSection) {
      return NextResponse.json(
        { error: `Тема с номером ${topicNumber} уже существует в разделе "${existingTopicOtherSection.section}". Номера тем должны быть уникальны в рамках всего сайта.` },
        { status: 400 }
      )
    }

    const topicData = {
      id: topicNumber,
      topic_number: topicNumber,
      title: title,
      description: description || '',
      body: content || `# ${title}\n\nНачните писать содержание темы здесь...\n`,
      date: date || new Date().toISOString().split('T')[0],
      author: author || 'Преподаватель',
      keywords: Array.isArray(keywords) ? keywords : [],
      section: section, // Сохраняем выбранный раздел
      order: order
    }

    // Обновляем или добавляем тему
    if (existingTopicInSection) {
      const index = topics.findIndex(t => t.topic_number === topicNumber && t.section === section)
      topics[index] = topicData
    } else {
      topics.push(topicData)
    }

    // Сохраняем все темы
    const success = saveAllTopics(topics)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Ошибка сохранения тем' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: existingTopicInSection ? `Тема ${topicNumber} обновлена в разделе "${section}"` : `Тема ${topicNumber} создана в разделе "${section}"`,
        topic: topicData
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving topic:', error)
    return NextResponse.json(
      { error: 'Ошибка сохранения темы: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Не указан ID темы' },
        { status: 400 }
      )
    }

    const topicId = parseInt(id)
    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Неверный формат ID темы' },
        { status: 400 }
      )
    }

    // Читаем существующие темы
    const topics = readAllTopics()
    
    // Находим тему для удаления
    const topicIndex = topics.findIndex(t => t.topic_number === topicId)
    
    if (topicIndex === -1) {
      return NextResponse.json(
        { error: 'Тема не найдена' },
        { status: 404 }
      )
    }

    // Удаляем тему
    topics.splice(topicIndex, 1)
    
    // Сохраняем обновленный список
    const success = saveAllTopics(topics)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Ошибка удаления темы' },
        { status: 500 }
      )
    }

    // Если это тема из раздела "Пожары" 1-26, удаляем также Markdown файл
    const topicToDelete = topics[topicIndex]
    if (topicToDelete?.section === 'fires' && topicId >= 1 && topicId <= 26) {
      const mdFilePath = path.join(contentDirectory, 'topics', `topic-${topicId}.md`)
      if (fs.existsSync(mdFilePath)) {
        fs.unlinkSync(mdFilePath)
      }
    }

    return NextResponse.json(
      { success: true, message: `Тема ${topicId} удалена` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления темы' },
      { status: 500 }
    )
  }
}