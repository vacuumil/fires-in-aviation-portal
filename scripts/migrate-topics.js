// scripts/migrate-topics.js
const fs = require('fs')
const path = require('path')

async function migrateTopics() {
  console.log('🚀 Начинаем миграцию тем в новую структуру...')
  
  try {
    // Читаем существующие темы
    const topicsPath = path.join(__dirname, '../app/content/topics.json')
    const topicsData = fs.readFileSync(topicsPath, 'utf8')
    const topics = JSON.parse(topicsData)
    
    console.log(`📚 Найдено ${topics.length} тем для миграции`)
    
    // Создаем структуру по разделам
    const sections = ['fires', 'emergency', 'education', 'protection']
    
    // Очищаем существующие директории (опционально)
    for (const section of sections) {
      const sectionDir = path.join(__dirname, '../app/content', section)
      if (fs.existsSync(sectionDir)) {
        console.log(`📁 Очищаем директорию: ${section}`)
        const files = fs.readdirSync(sectionDir)
        files.forEach(file => {
          if (file.endsWith('.md')) {
            fs.unlinkSync(path.join(sectionDir, file))
          }
        })
      } else {
        fs.mkdirSync(sectionDir, { recursive: true })
      }
    }
    
    let migrated = 0
    let skipped = 0
    
    // Мигрируем каждую тему
    for (const topic of topics) {
      if (!topic.topic_number || !topic.title) {
        console.log(`⚠️ Пропускаем тему без номера или названия:`, topic)
        skipped++
        continue
      }
      
      const section = topic.section || 'fires'
      
      // Формируем frontmatter для MD файла
      const frontmatter = `---
topic_number: ${topic.topic_number}
title: "${escapeString(topic.title)}"
description: "${escapeString(topic.description || '')}"
date: "${topic.date || new Date().toISOString().split('T')[0]}"
author: "${escapeString(topic.author || 'Преподаватель')}"
keywords:
${Array.isArray(topic.keywords) 
  ? topic.keywords.map(k => `  - "${escapeString(k)}"`).join('\n')
  : '  []'}
section: "${section}"
order: ${topic.order || topic.topic_number}
---

${topic.body || topic.content || `# ${topic.title}\n\nНачните писать содержание темы здесь...`}`
      
      // Сохраняем тему в раздел
      const fileName = `topic-${topic.topic_number}.md`
      const filePath = path.join(__dirname, '../app/content', section, fileName)
      
      fs.writeFileSync(filePath, frontmatter, 'utf8')
      console.log(`✅ Мигрирована тема ${topic.topic_number} в раздел ${section}`)
      migrated++
    }
    
    console.log('\n🎉 Миграция завершена!')
    console.log(`✅ Успешно мигрировано: ${migrated} тем`)
    console.log(`⚠️ Пропущено: ${skipped} тем`)
    
    // Создаем бэкап старого файла
    const backupPath = path.join(__dirname, '../app/content/topics-backup.json')
    fs.copyFileSync(topicsPath, backupPath)
    console.log(`💾 Создан бэкап: ${backupPath}`)
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
    process.exit(1)
  }
}

function escapeString(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

migrateTopics()