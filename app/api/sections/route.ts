// app/api/sections/route.ts - если вам нужен отдельный endpoint для секций
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const sectionsFilePath = path.join(process.cwd(), 'app/content/sections.json')

export async function GET() {
  try {
    if (!fs.existsSync(sectionsFilePath)) {
      return NextResponse.json([])
    }
    
    const data = fs.readFileSync(sectionsFilePath, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('Error reading sections:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    let sections = []
    if (fs.existsSync(sectionsFilePath)) {
      const data = fs.readFileSync(sectionsFilePath, 'utf8')
      sections = JSON.parse(data)
    }
    
    sections.push({
      ...body,
      id: Date.now().toString()
    })
    
    fs.writeFileSync(sectionsFilePath, JSON.stringify(sections, null, 2), 'utf8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!fs.existsSync(sectionsFilePath)) {
      return NextResponse.json({ error: 'Секция не найдена' }, { status: 404 })
    }
    
    const data = fs.readFileSync(sectionsFilePath, 'utf8')
    let sections = JSON.parse(data)
    
    sections = sections.map((section: any) => 
      section.slug === body.slug ? { ...section, ...body } : section
    )
    
    fs.writeFileSync(sectionsFilePath, JSON.stringify(sections, null, 2), 'utf8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}