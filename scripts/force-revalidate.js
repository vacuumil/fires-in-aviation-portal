// scripts/force-revalidate.js
const fs = require('fs')

// Добавьте в каждую страницу в самом начале:
const forceRevalidate = `
// ⚠️ ФОРСИРОВАННАЯ РЕВАЛИДАЦИЯ
export const revalidate = 0
export const dynamic = 'force-dynamic'
`

const pagesToUpdate = [
  'app/(main)/[section]/page.tsx',
  'app/(main)/topics/[slug]/page.tsx',
  'app/(main)/page.tsx'
]

pagesToUpdate.forEach(page => {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, 'utf8')
    if (!content.includes('export const revalidate = 0')) {
      const updatedContent = forceRevalidate + '\n' + content
      fs.writeFileSync(page, updatedContent)
      console.log(`✅ Updated: ${page}`)
    }
  }
})