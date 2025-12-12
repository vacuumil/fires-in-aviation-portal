// app/components/ui/Search.tsx - ИСПРАВЛЕННЫЙ
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search as SearchIcon, X, Book, FileText } from 'lucide-react'
import debounce from 'lodash/debounce'
import Link from 'next/link'

interface SearchResult {
  id: number
  topic_number: number
  title: string
  description: string
  section: string
}

interface SearchProps {
  variant?: 'default' | 'modal'
  onClose?: () => void
}

export default function Search({ variant = 'default', onClose }: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.slice(0, 5))
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    performSearch(query)
  }, [query, performSearch])

  const handleClose = () => {
    setQuery('')
    setResults([])
    if (onClose) onClose()
  }

  // Обработчик клавиши Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (variant === 'default') {
    return null // Теперь поиск скрыт, показывается только иконка в Header
  }

  return (
    <>
      {/* Модальное окно поиска */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск тем, разделов, материалов..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                aria-label="Очистить поиск"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Отмена
          </button>
        </div>
        
        {query && (
          <div className="text-sm text-gray-500">
            Поиск по запросу: <span className="font-medium">"{query}"</span>
          </div>
        )}
      </div>

      {/* Результаты поиска */}
      <div className="overflow-y-auto max-h-[50vh]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <p className="mt-3 text-gray-500">Ищем материалы...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="p-2">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/topics/${result.topic_number}`}
                onClick={handleClose}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200">
                  {result.section === 'fires' ? (
                    <FileText className="w-5 h-5 text-red-600" />
                  ) : (
                    <Book className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                    {result.title}
                  </h4>
                  {result.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      Тема №{result.topic_number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.section === 'fires' ? 'Пожары' : 
                       result.section === 'emergency' ? 'Чрезвычайные ситуации' :
                       result.section === 'education' ? 'Образование' : 'Защита'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="p-8 text-center">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Ничего не найдено по запросу "{query}"</p>
            <p className="text-sm text-gray-400 mt-2">Попробуйте изменить запрос</p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Введите запрос для поиска</p>
            <p className="text-sm text-gray-400 mt-2">Начните вводить название темы или ключевое слово</p>
          </div>
        )}
      </div>
    </>
  )
}