// app/api/revalidate-topic/route.ts - ДЛЯ РЕВАЛИДАЦИИ ПОСЛЕ СОХРАНЕНИЯ
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, topicNumber, secret } = body
    
    // Проверка секрета (опционально)
    if (secret && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }
    
    // Ревалидируем нужные пути
    if (section) {
      revalidatePath(`/${section}`, 'page')
    }
    
    if (topicNumber) {
      revalidatePath(`/topics/${topicNumber}`, 'page')
    }
    
    // Всегда ревалидируем главную
    revalidatePath('/', 'page')
    
    console.log(`✅ Revalidated: /${section || ''}, /topics/${topicNumber || ''}`)
    
    return NextResponse.json({ 
      success: true,
      revalidated: true,
      section,
      topicNumber 
    })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Revalidation error:', errorMessage)
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 })
  }
}