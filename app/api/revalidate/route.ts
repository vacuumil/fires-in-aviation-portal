// app/api/revalidate/route.ts - ПРОСТАЯ ВЕРСИЯ ДЛЯ VERCEL
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path') || '/'
    
    console.log(`🔄 Revalidating path: ${path}`)
    
    // Ревалидируем указанный путь
    revalidatePath(path, 'page')
    revalidatePath(path, 'layout')
    
    // Также ревалидируем главную
    if (path !== '/') {
      revalidatePath('/', 'page')
    }
    
    return NextResponse.json({ 
      success: true,
      revalidated: true,
      path,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Error revalidating:', error.message)
    // Не возвращаем 500 ошибку, чтобы не ломать сохранение темы
    return NextResponse.json({ 
      success: false,
      error: error.message,
      note: 'Revalidation failed but topic was saved'
    }, { status: 200 }) // Возвращаем 200 чтобы не ломать клиент
  }
}

// Добавляем OPTIONS для CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}