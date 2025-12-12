// app/api/upload/route.ts - ЛОКАЛЬНАЯ ЗАГРУЗКА БЕЗ VERCEL BLOB
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Разрешенные MIME типы
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]

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
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: `Неподдерживаемый тип файла. Разрешены: ${ALLOWED_MIME_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Проверка размера файла (максимум 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      )
    }

    // Конвертируем файл в буфер
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Создаем уникальное имя файла
    const originalExtension = file.name.split('.').pop() || 'jpg'
    const safeExtension = originalExtension.toLowerCase()
    const uniqueId = uuidv4().substring(0, 8)
    const timestamp = Date.now()
    const fileName = `img-${timestamp}-${uniqueId}.${safeExtension}`
    
    // Путь для сохранения
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    
    // Создаем директорию если не существует
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error('Error creating upload directory:', error)
      return NextResponse.json(
        { error: 'Ошибка создания директории для загрузки' },
        { status: 500 }
      )
    }
    
    const filePath = path.join(uploadDir, fileName)
    
    // Сохраняем файл
    await writeFile(filePath, buffer)
    
    // URL для доступа к файлу
    const publicUrl = `/uploads/images/${fileName}`
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type,
      message: 'Изображение успешно загружено'
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка загрузки файла: ' + (error.message || 'Неизвестная ошибка') 
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}