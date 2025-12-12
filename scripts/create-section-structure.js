// scripts/create-section-structure.js
const fs = require('fs')
const path = require('path')

async function createStructure() {
  const baseDir = path.join(__dirname, '../app/content')
  
  // Создаем папки разделов
  const sections = ['fires', 'emergency', 'education', 'protection']
  
  sections.forEach(section => {
    const dir = path.join(baseDir, section)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ Создана папка: ${section}`)
    } else {
      console.log(`📁 Папка уже существует: ${section}`)
    }
  })
  
  // Создаем базовые файлы для каждого раздела (примеры)
  const sampleTopics = {
    fires: [
      {
        id: 1,
        topic_number: 1,
        title: "Теоретические основы пожарной безопасности",
        description: "Основные понятия и определения",
        content: "# Теоретические основы\n\nОсновной контент темы...",
        body: "# Теоретические основы\n\nОсновной контент темы...",
        date: "2025-01-15",
        author: "Преподаватель",
        keywords: ["пожарная безопасность", "теория", "основы"],
        section: "fires",
        order: 1
      }
    ],
    emergency: [],
    education: [],
    protection: []
  }
  
  // Сохраняем примеры тем
  Object.entries(sampleTopics).forEach(([section, topics]) => {
    topics.forEach(topic => {
      const filePath = path.join(baseDir, section, `topic-${topic.topic_number}.json`)
      fs.writeFileSync(
        filePath,
        JSON.stringify(topic, null, 2),
        'utf8'
      )
      console.log(`📝 Создан пример темы: ${section}/topic-${topic.topic_number}.json`)
    })
  })
  
  console.log('\n✅ Структура создана!')
  console.log('Запустите: npm run dev')
}

createStructure()