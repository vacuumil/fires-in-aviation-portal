// app/api/upload/route.ts - ПРАВИЛЬНАЯ ВЕРСИЯ ДЛЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Пожалуйста, загрузите изображение' },
        { status: 400 }
      )
    }

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      )
    }

    // Конвертируем файл в буфер
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Создаем уникальное имя файла
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${timestamp}-${originalName}`
    
    // Определяем путь для сохранения
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Создаем директорию если не существует
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }
    
    const filePath = path.join(uploadDir, fileName)
    
    // Сохраняем файл
    await fs.writeFile(filePath, buffer)
    
    // Возвращаем URL файла
    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      filename: fileName,
      size: file.size,
      type: file.type
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки файла: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}