// app/api/github/clear-cache/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json()
    
    // Проверка секрета
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }
    
    // Ревалидируем указанный путь
    if (path) {
      revalidatePath(path, 'page')
      console.log(`✅ Revalidated path: ${path}`)
    }
    
    // Очищаем все пути по умолчанию
    revalidatePath('/', 'page')
    revalidatePath('/fires', 'page')
    revalidatePath('/emergency', 'page')
    revalidatePath('/education', 'page')
    revalidatePath('/protection', 'page')
    
    return NextResponse.json({ 
      success: true,
      message: 'Cache cleared and revalidated' 
    })
    
  } catch (error: any) {
    console.error('Error clearing cache:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}