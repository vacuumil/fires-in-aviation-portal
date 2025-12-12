// app/api/sections/[section]/topics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params
    const validSections = ['fires', 'emergency', 'education', 'protection']
    
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Неверный раздел. Допустимые значения: fires, emergency, education, protection' },
        { status: 400 }
      )
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
      order
    } = body
    
    // Валидация
    if (!topic_number || !title) {
      return NextResponse.json(
        { error: 'Необходимы номер темы и заголовок' },
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
    
    const sectionDir = path.join(process.cwd(), 'app/content', section)
    
    // Создаем папку раздела, если не существует
    if (!fs.existsSync(sectionDir)) {
      fs.mkdirSync(sectionDir, { recursive: true })
    }
    
    // Проверяем уникальность номера темы в разделе
    const existingFiles = fs.existsSync(sectionDir) 
      ? fs.readdirSync(sectionDir).filter(f => f.endsWith('.md'))
      : []
    
    const existingFile = existingFiles.find(f => {
      const match = f.match(/topic-(\d+)\.md/)
      return match && parseInt(match[1]) === topicNumber
    })
    
    // Формируем frontmatter для MD файла
    const frontmatter = `---
topic_number: ${topicNumber}
title: "${title.replace(/"/g, '\\"')}"
description: "${description ? description.replace(/"/g, '\\"') : ''}"
date: "${date || new Date().toISOString().split('T')[0]}"
author: "${author || 'Преподаватель'}"
keywords:
${keywords.map((k: string) => `  - "${k.replace(/"/g, '\\"')}"`).join('\n')}
section: "${section}"
order: ${order || topicNumber}
---

`
    
    // Полный контент MD файла
    const mdContent = frontmatter + (content || '# ' + title + '\n\nНачните писать содержание темы здесь...\n')
    
    // Сохраняем тему
    const fileName = `topic-${topicNumber}.md`
    const filePath = path.join(sectionDir, fileName)
    
    fs.writeFileSync(filePath, mdContent, 'utf8')
    
    // Формируем ответ с данными темы
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
      order: order || topicNumber
    }
    
    return NextResponse.json({
      success: true,
      message: existingFile 
        ? `Тема ${topicNumber} обновлена в разделе "${section}"` 
        : `Тема ${topicNumber} создана в разделе "${section}"`,
      topic: topicData,
      filePath: `${section}/${fileName}`,
      fileType: 'md'
    })
    
  } catch (error) {
    console.error('Error saving topic:', error)
    return NextResponse.json(
      { error: 'Ошибка сохранения темы: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params
    const searchParams = request.nextUrl.searchParams
    const topicId = searchParams.get('id')
    
    if (!topicId) {
      return NextResponse.json(
        { error: 'Не указан ID темы' },
        { status: 400 }
      )
    }
    
    const topicNumber = parseInt(topicId)
    if (isNaN(topicNumber)) {
      return NextResponse.json(
        { error: 'Неверный формат ID темы' },
        { status: 400 }
      )
    }
    
    const sectionDir = path.join(process.cwd(), 'app/content', section)
    const filePath = path.join(sectionDir, `topic-${topicNumber}.md`)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Тема не найдена' },
        { status: 404 }
      )
    }
    
    // Удаляем файл
    fs.unlinkSync(filePath)
    
    return NextResponse.json({
      success: true,
      message: `Тема ${topicNumber} удалена из раздела "${section}"`
    })
    
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления темы' },
      { status: 500 }
    )
  }
}