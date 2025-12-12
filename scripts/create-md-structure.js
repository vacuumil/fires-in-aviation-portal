// scripts/create-md-structure.js
const fs = require('fs')
const path = require('path')

async function createMDStructure() {
  console.log('📁 Создаем структуру MD файлов...\n')
  
  const baseDir = path.join(__dirname, '../app/content')
  
  // Создаем папки разделов
  const sections = [
    { id: 'fires', name: 'Пожары', prefix: 1, color: 'from-red-500 to-orange-500' },
    { id: 'emergency', name: 'Чрезвычайные ситуации', prefix: 101, color: 'from-orange-500 to-amber-500' },
    { id: 'education', name: 'Образование', prefix: 201, color: 'from-blue-500 to-cyan-500' },
    { id: 'protection', name: 'Защита', prefix: 301, color: 'from-green-500 to-emerald-500' }
  ]
  
  sections.forEach(section => {
    const dir = path.join(baseDir, section.id)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Создана папка: ${section.id}/`)
    } else {
      console.log(`📁 Папка уже существует: ${section.id}/`)
    }
  })
  
  // Создаем примеры тем для каждого раздела
  sections.forEach(section => {
    const exampleTopic = {
      topic_number: section.prefix,
      title: `Пример темы для раздела "${section.name}"`,
      description: `Это пример темы для раздела ${section.name}. Замените этот текст на актуальное содержание.`,
      date: new Date().toISOString().split('T')[0],
      author: 'Преподаватель',
      keywords: ['пример', 'тема', section.name.toLowerCase()],
      section: section.id,
      order: 1
    }
    
    const mdContent = `---
topic_number: ${exampleTopic.topic_number}
title: "${exampleTopic.title}"
description: "${exampleTopic.description}"
date: "${exampleTopic.date}"
author: "${exampleTopic.author}"
keywords:
  - ${exampleTopic.keywords.join('\n  - ')}
section: "${exampleTopic.section}"
order: ${exampleTopic.order}
---

# ${exampleTopic.title}

Это пример содержимого темы для раздела **${section.name}**.

## Основные разделы

1. Введение
2. Основные понятия
3. Примеры
4. Заключение

## Форматирование

Вы можете использовать **жирный текст**, *курсив*, [ссылки](https://example.com) и другие элементы Markdown.

\`\`\`javascript
// Пример кода
console.log("Пример темы");
\`\`\`

> Это пример цитаты

- Пункт списка 1
- Пункт списка 2
- Пункт списка 3

## Изображения

![Пример изображения](https://via.placeholder.com/600x400)

Продолжайте писать содержание темы здесь...
`
    
    const filePath = path.join(baseDir, section.id, `topic-${exampleTopic.topic_number}.md`)
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, mdContent, 'utf8')
      console.log(`📝 Создан пример темы: ${section.id}/topic-${exampleTopic.topic_number}.md`)
    }
  })
  
  // Проверяем существующие MD файлы в старой структуре
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
          const destPath = path.join(baseDir, 'fires', file)
          
          // Копируем только если файл 1-26 (раздел "Пожары")
          if (topicNumber >= 1 && topicNumber <= 26) {
            fs.copyFileSync(sourcePath, destPath)
            console.log(`  ↳ Скопирован: ${file} → fires/`)
          }
        }
      })
    }
  }
  
  console.log('\n✅ Структура создана!')
  console.log('\n📋 Структура папок:')
  console.log('='.repeat(50))
  console.log('app/content/')
  sections.forEach(section => {
    const dir = path.join(baseDir, section.id)
    const files = fs.existsSync(dir) 
      ? fs.readdirSync(dir).filter(f => f.endsWith('.md')).length 
      : 0
    console.log(`├── ${section.id}/ (${files} тем)`)
  })
  console.log('='.repeat(50))
  console.log('\n🚀 Запустите проект: npm run dev')
  console.log('🔧 Админка: /admin/simple')
}

createMDStructure()