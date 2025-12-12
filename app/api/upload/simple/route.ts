// app/api/upload/simple/route.ts - ПРОСТАЯ ЗАГРУЗКА
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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

    // Проверка размера файла
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      )
    }

    // Конвертируем в буфер
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Создаем имя файла
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${safeName}`
    
    // Путь для сохранения
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Папка уже существует
    }
    
    const filePath = join(uploadDir, fileName)
    
    // Сохраняем файл
    await writeFile(filePath, buffer)
    
    // Возвращаем URL
    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      filename: fileName
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
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