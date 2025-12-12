// app/status/page.tsx - СТРАНИЦА ДЛЯ ПРОВЕРКИ
import Link from 'next/link'

async function checkAPI(endpoint: string) {
  try {
    const url = `http://localhost:3000${endpoint}`
    const response = await fetch(url, { cache: 'no-store' })
    const data = await response.json()
    return {
      endpoint,
      status: response.status,
      ok: response.ok,
      count: Array.isArray(data) ? data.length : 'N/A',
      error: null
    }
  } catch (error: any) {
    return {
      endpoint,
      status: 'ERROR',
      ok: false,
      count: 'N/A',
      error: error.message
    }
  }
}

export default async function StatusPage() {
  const endpoints = [
    '/api/github/topics?section=fires',
    '/api/github/topics?section=emergency',
    '/api/github/topics?section=education',
    '/api/github/topics?section=protection',
    '/api/sections/fires',
    '/api/sections/emergency'
  ]
  
  const checks = await Promise.all(endpoints.map(checkAPI))
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Статус системы</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {checks.map((check, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${check.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm">{check.endpoint}</p>
                <p className="text-sm mt-1">
                  Status: <span className={`font-bold ${check.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {check.status}
                  </span>
                </p>
                {Array.isArray(check.count) && (
                  <p className="text-sm">Тем: {check.count}</p>
                )}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${check.ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {check.ok ? '✓' : '✗'}
              </div>
            </div>
            {check.error && (
              <p className="text-sm text-red-600 mt-2">{check.error}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Вернуться на главную
        </Link>
      </div>
    </div>
  )
}