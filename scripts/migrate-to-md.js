// scripts/migrate-to-md.js
const fs = require('fs')
const path = require('path')

async function migrateToMD() {
  console.log('🔄 Миграция данных в MD формат...\n')
  
  const baseDir = path.join(__dirname, '../app/content')
  
  // Создаем папки разделов
  const sections = [
    { id: 'fires', name: 'Пожары', prefix: 1 },
    { id: 'emergency', name: 'Чрезвычайные ситуации', prefix: 101 },
    { id: 'education', name: 'Образование', prefix: 201 },
    { id: 'protection', name: 'Защита', prefix: 301 }
  ]
  
  sections.forEach(section => {
    const dir = path.join(baseDir, section.id)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Создана папка: ${section.id}/`)
    }
  })
  
  // 1. Мигрируем из topics.json
  const topicsJsonPath = path.join(baseDir, 'topics.json')
  if (fs.existsSync(topicsJsonPath)) {
    try {
      const topicsJson = JSON.parse(fs.readFileSync(topicsJsonPath, 'utf8'))
      console.log(`📊 Найдено ${topicsJson.length} тем в topics.json`)
      
      let migratedCount = 0
      
      topicsJson.forEach(topic => {
        try {
          const section = topic.section || 'fires'
          const topicNumber = topic.topic_number
          
          // Создаем frontmatter
          const frontmatter = `---
topic_number: ${topicNumber}
title: "${(topic.title || `Тема ${topicNumber}`).replace(/"/g, '\\"')}"
description: "${(topic.description || '').replace(/"/g, '\\"')}"
date: "${topic.date || new Date().toISOString().split('T')[0]}"
author: "${topic.author || 'Преподаватель'}"
keywords:
${(topic.keywords || []).map(k => `  - "${k.replace(/"/g, '\\"')}"`).join('\n')}
section: "${section}"
order: ${topic.order || topicNumber}
---

`
          
          const mdContent = frontmatter + (topic.content || topic.body || `# ${topic.title}\n\nСодержание темы...\n`)
          const fileName = `topic-${topicNumber}.md`
          const filePath = path.join(baseDir, section, fileName)
          
          fs.writeFileSync(filePath, mdContent, 'utf8')
          migratedCount++
          console.log(`  ↳ Тема ${topicNumber} → ${section}/${fileName}`)
          
        } catch (err) {
          console.error(`  ✗ Ошибка темы ${topic.topic_number}:`, err.message)
        }
      })
      
      console.log(`\n✅ Мигрировано из JSON: ${migratedCount} тем`)
      
    } catch (error) {
      console.error('❌ Ошибка чтения topics.json:', error)
    }
  }
  
  // 2. Копируем существующие MD файлы
  const oldTopicsDir = path.join(baseDir, 'topics')
  if (fs.existsSync(oldTopicsDir)) {
    const mdFiles = fs.readdirSync(oldTopicsDir).filter(f => f.endsWith('.md'))
    
    if (mdFiles.length > 0) {
      console.log(`\n📄 Найдено ${mdFiles.length} MD файлов в старой структуре`)
      
      mdFiles.forEach(file => {
        const match = file.match(/topic-(\d+)\.md/)
        if (match) {
          const topicNumber = parseInt(match[1])
          const sourcePath = path.join(oldTopicsDir, file)
          
          // Определяем раздел по номеру темы
          let targetSection = 'fires'
          if (topicNumber >= 101 && topicNumber <= 199) targetSection = 'emergency'
          else if (topicNumber >= 201 && topicNumber <= 299) targetSection = 'education'
          else if (topicNumber >= 301 && topicNumber <= 399) targetSection = 'protection'
          
          const destPath = path.join(baseDir, targetSection, file)
          
          // Читаем и обновляем frontmatter
          try {
            const content = fs.readFileSync(sourcePath, 'utf8')
            const lines = content.split('\n')
            
            // Ищем frontmatter и добавляем section если его нет
            let inFrontmatter = false
            let hasSection = false
            let updatedContent = ''
            
            for (const line of lines) {
              updatedContent += line + '\n'
              
              const trimmedLine = line.trim()
              
              if (trimmedLine === '---') {
                inFrontmatter = !inFrontmatter
                continue
              }
              
              if (inFrontmatter && trimmedLine.startsWith('section:')) {
                hasSection = true
              }
            }
            
            // Если section не указан, добавляем
            if (!hasSection) {
              updatedContent = updatedContent.replace('---\n', `---\nsection: "${targetSection}"\n`)
            }
            
            fs.writeFileSync(destPath, updatedContent, 'utf8')
            console.log(`  ↳ ${file} → ${targetSection}/ (обновлен frontmatter)`)
            
          } catch (err) {
            console.error(`  ✗ Ошибка файла ${file}:`, err.message)
          }
        }
      })
    }
  }
  
  // Статистика
  console.log('\n📊 Статистика по разделам:')
  console.log('='.repeat(40))
  sections.forEach(section => {
    const dir = path.join(baseDir, section.id)
    const files = fs.existsSync(dir) 
      ? fs.readdirSync(dir).filter(f => f.endsWith('.md')).length 
      : 0
    console.log(`  ${section.id}: ${files} тем`)
  })
  console.log('='.repeat(40))
  
  console.log('\n🎉 Миграция завершена!')
  console.log('\n📋 Файлы сохранены в формате:')
  console.log('   app/content/[раздел]/topic-[номер].md')
  console.log('\n🔧 Проверьте админку: /admin/simple')
}

migrateToMD()