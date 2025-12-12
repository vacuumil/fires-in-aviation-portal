// app/components/ui/RefreshButton.tsx
'use client'

import { RefreshCw } from 'lucide-react'

export default function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Обновить страницу сейчас
    </button>
  )
}