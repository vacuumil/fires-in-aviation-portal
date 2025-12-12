// scripts/migrate-data.js
const fs = require('fs')
const path = require('path')

async function migrateData() {
  console.log('🚀 Начинаем миграцию данных...\n')
  
  const baseDir = path.join(__dirname, '../app/content')
  
  // Создаем структуру папок
  const sections = ['fires', 'emergency', 'education', 'protection']
  sections.forEach(section => {
    const dir = path.join(baseDir, section)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Создана папка: ${section}`)
    }
  })
  
  // 1. Мигрируем существующие темы из topics.json
  const topicsJsonPath = path.join(baseDir, 'topics.json')
  if (fs.existsSync(topicsJsonPath)) {
    try {
      const topicsJson = JSON.parse(fs.readFileSync(topicsJsonPath, 'utf8'))
      
      console.log(`📊 Найдено ${topicsJson.length} тем в topics.json`)
      
      let migratedCount = 0
      let errorCount = 0
      
      topicsJson.forEach(topic => {
        try {
          const section = topic.section || 'fires'
          const fileName = `topic-${topic.topic_number}.json`
          const filePath = path.join(baseDir, section, fileName)
          
          // Нормализуем данные
          const normalizedTopic = {
            id: topic.topic_number,
            topic_number: topic.topic_number,
            title: topic.title || `Тема ${topic.topic_number}`,
            description: topic.description || '',
            content: topic.body || topic.content || '',
            body: topic.body || topic.content || '',
            date: topic.date || new Date().toISOString().split('T')[0],
            author: topic.author || 'Преподаватель',
            keywords: topic.keywords || [],
            section: section,
            order: topic.order || topic.topic_number
          }
          
          fs.writeFileSync(
            filePath,
            JSON.stringify(normalizedTopic, null, 2),
            'utf8'
          )
          
          migratedCount++
          console.log(`  ↳ Тема ${topic.topic_number} → ${section}/${fileName}`)
          
        } catch (err) {
          console.error(`  ✗ Ошибка миграции темы ${topic.topic_number}:`, err.message)
          errorCount++
        }
      })
      
      console.log(`\n✅ Мигрировано: ${migratedCount} тем`)
      if (errorCount > 0) {
        console.log(`❌ Ошибок: ${errorCount}`)
      }
      
      // Делаем backup оригинального файла
      const backupPath = topicsJsonPath + '.backup'
      fs.copyFileSync(topicsJsonPath, backupPath)
      console.log(`📦 Создан backup: ${backupPath}`)
      
    } catch (error) {
      console.error('❌ Ошибка чтения topics.json:', error)
    }
  } else {
    console.log('📭 Файл topics.json не найден')
  }
  
  // 2. Мигрируем старые MD файлы из topics/
  const oldTopicsDir = path.join(baseDir, 'topics')
  if (fs.existsSync(oldTopicsDir)) {
    const mdFiles = fs.readdirSync(oldTopicsDir).filter(f => f.endsWith('.md'))
    
    console.log(`\n📄 Найдено ${mdFiles.length} MD файлов в старой структуре`)
    
    mdFiles.forEach(file => {
      try {
        const match = file.match(/topic-(\d+)\.md/)
        if (match) {
          const topicNumber = parseInt(match[1])
          
          // Проверяем, не была ли уже эта тема мигрирована из JSON
          const jsonPath = path.join(baseDir, 'fires', `topic-${topicNumber}.json`)
          
          if (!fs.existsSync(jsonPath)) {
            const filePath = path.join(oldTopicsDir, file)
            const content = fs.readFileSync(filePath, 'utf8')
            
            // Простой парсинг frontmatter
            const lines = content.split('\n')
            let inFrontmatter = false
            const metadata = {}
            let bodyLines = []
            
            for (const line of lines) {
              const trimmedLine = line.trim()
              
              if (trimmedLine === '---') {
                inFrontmatter = !inFrontmatter
                continue
              }
              
              if (inFrontmatter) {
                const match = trimmedLine.match(/^([^:]+):\s*(.+)$/)
                if (match) {
                  const [, key, value] = match
                  let parsedValue = value.trim()
                  
                  // Убираем кавычки
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
            
            const topicData = {
              id: topicNumber,
              topic_number: topicNumber,
              title: metadata.title || `Тема ${topicNumber}`,
              description: metadata.description || '',
              content: bodyLines.join('\n').trim(),
              body: bodyLines.join('\n').trim(),
              date: metadata.date || new Date().toISOString().split('T')[0],
              author: metadata.author || 'Преподаватель',
              keywords: metadata.keywords ? 
                (Array.isArray(metadata.keywords) ? metadata.keywords : 
                 typeof metadata.keywords === 'string' ? 
                 metadata.keywords.split(',').map(k => k.trim()).filter(k => k) : []) : [],
              section: 'fires',
              order: topicNumber
            }
            
            fs.writeFileSync(
              jsonPath,
              JSON.stringify(topicData, null, 2),
              'utf8'
            )
            
            console.log(`  ↳ MD тема ${topicNumber} → fires/topic-${topicNumber}.json`)
          }
        }
      } catch (err) {
        console.error(`  ✗ Ошибка миграции MD файла ${file}:`, err.message)
      }
    })
  }
  
  // 3. Создаем файл со статистикой
  const stats = {}
  let totalTopics = 0
  
  sections.forEach(section => {
    const sectionDir = path.join(baseDir, section)
    if (fs.existsSync(sectionDir)) {
      const files = fs.readdirSync(sectionDir).filter(f => f.endsWith('.json'))
      stats[section] = files.length
      totalTopics += files.length
    } else {
      stats[section] = 0
    }
  })
  
  const statsPath = path.join(baseDir, 'migration-stats.json')
  fs.writeFileSync(
    statsPath,
    JSON.stringify({
      migratedAt: new Date().toISOString(),
      totalTopics,
      bySection: stats
    }, null, 2),
    'utf8'
  )
  
  console.log('\n📊 Статистика миграции:')
  console.log('='.repeat(40))
  console.log(`Всего тем: ${totalTopics}`)
  sections.forEach(section => {
    console.log(`  ${section}: ${stats[section]} тем`)
  })
  console.log('='.repeat(40))
  
  console.log('\n🎉 Миграция завершена!')
  console.log('\n📋 Рекомендуемые действия:')
  console.log('1. Проверьте админ-панель: /admin/simple')
  console.log('2. Убедитесь, что все темы отображаются')
  console.log('3. Проверьте страницы разделов: /fires, /emergency и т.д.')
  console.log('4. Если все работает, можно удалить старые файлы:')
  console.log('   - app/content/topics.json.backup')
  console.log('   - app/content/topics/ (папка с MD файлами)')
  console.log('   - app/content/migration-stats.json')
}

migrateData()