// app/api/revalidate/route.ts - УПРОЩЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path') || '/'

    // В production используйте секретный токен
    // const secret = searchParams.get('secret')
    // if (secret !== process.env.REVALIDATE_SECRET) {
    //   return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    // }

    // Импортируем revalidatePath
    const { revalidatePath } = await import('next/cache')
    
    // Ревалидируем указанный путь
    revalidatePath(path, 'page')
    
    console.log(`✅ Revalidated: ${path}`)

    return NextResponse.json({ 
      success: true,
      revalidated: true, 
      path,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error revalidating: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    )
  }
}