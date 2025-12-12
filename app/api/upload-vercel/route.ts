// app/api/upload-vercel/route.ts - ПРОКСИ ДЛЯ ЛОКАЛЬНОЙ ЗАГРУЗКИ
import { NextRequest, NextResponse } from 'next/server'

// Просто перенаправляем на локальный endpoint
export async function POST(request: NextRequest) {
  try {
    // Перенаправляем запрос на локальный endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/upload`, {
      method: 'POST',
      body: await request.formData()
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
    
  } catch (error: any) {
    console.error('Upload proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка загрузки файла',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}