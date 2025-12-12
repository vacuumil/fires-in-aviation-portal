// scripts/check-structure.js
const fs = require('fs')
const path = require('path')

function checkStructure() {
  console.log('🔍 Проверка структуры проекта...\n')
  
  const baseDir = path.join(__dirname, '../app/content')
  
  // Проверяем наличие папок разделов
  const requiredSections = ['fires', 'emergency', 'education', 'protection']
  const sectionsStatus = {}
  
  requiredSections.forEach(section => {
    const dir = path.join(baseDir, section)
    const exists = fs.existsSync(dir)
    sectionsStatus[section] = exists
    
    if (exists) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
      console.log(`✅ ${section}: ${files.length} тем (${files.slice(0, 3).map(f => f.replace('.json', '')).join(', ')}${files.length > 3 ? '...' : ''})`)
    } else {
      console.log(`❌ ${section}: папка не найдена`)
    }
  })
  
  // Проверяем старые файлы
  console.log('\n📂 Старые файлы:')
  const oldTopicsDir = path.join(baseDir, 'topics')
  if (fs.existsSync(oldTopicsDir)) {
    const mdFiles = fs.readdirSync(oldTopicsDir).filter(f => f.endsWith('.md'))
    console.log(`  MD файлов: ${mdFiles.length}`)
  } else {
    console.log('  MD папка: не найдена')
  }
  
  const oldJsonPath = path.join(baseDir, 'topics.json')
  console.log(`  topics.json: ${fs.existsSync(oldJsonPath) ? 'найден' : 'не найден'}`)
  
  // Проверяем API endpoints
  console.log('\n🌐 Доступные API endpoints:')
  console.log('  GET /api/sections/[section]')
  console.log('  POST /api/sections/[section]/topics')
  console.log('  DELETE /api/sections/[section]/topics?id=[id]')
  console.log('  GET /api/search?q=[query]')
  
  // Рекомендации
  console.log('\n💡 Рекомендации:')
  const allMissing = requiredSections.filter(s => !sectionsStatus[s])
  if (allMissing.length > 0) {
    console.log(`  Создайте недостающие папки: ${allMissing.join(', ')}`)
  }
  
  const allEmpty = requiredSections.filter(s => {
    if (!sectionsStatus[s]) return false
    const dir = path.join(baseDir, s)
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
    return files.length === 0
  })
  
  if (allEmpty.length > 0) {
    console.log(`  Добавьте темы в разделы: ${allEmpty.join(', ')}`)
  }
  
  console.log('\n✅ Проверка завершена')
}

checkStructure()