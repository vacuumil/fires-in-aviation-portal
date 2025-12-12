// app/api/revalidate-topic/route.ts - ИСПРАВЛЕННЫЙ С CORS
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// CORS headers для Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { section, topicNumber } = body
    
    console.log('🔄 Revalidating cache for:', { section, topicNumber })
    
    // Ревалидируем основные пути
    revalidatePath('/', 'page')
    revalidatePath('/', 'layout')
    
    if (section) {
      revalidatePath(`/${section}`, 'page')
      revalidatePath(`/${section}`, 'layout')
    }
    
    if (topicNumber) {
      revalidatePath(`/topics/${topicNumber}`, 'page')
    }
    
    // Также ревалидируем все разделы на всякий случай
    const sections = ['fires', 'emergency', 'education', 'protection']
    sections.forEach(s => {
      if (s !== section) {
        revalidatePath(`/${s}`, 'page')
      }
    })
    
    console.log('✅ Cache revalidated successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Cache revalidated',
      section,
      topicNumber,
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders })
    
  } catch (error: any) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { 
      status: 500,
      headers: corsHeaders 
    })
  }
}