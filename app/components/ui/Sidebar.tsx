'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, Book, Menu, X, Search, Flame, AlertTriangle, Shield, GraduationCap } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  currentTopic?: number
}

// Обновляем структуру разделов
const sections = [
  { 
    id: 'fires', 
    title: 'Пожары', 
    icon: <Flame className="w-4 h-4" />,
    color: 'bg-red-100 text-red-800',
    description: '26 тем по пожарной безопасности'
  },
  { 
    id: 'emergency', 
    title: 'Чрезвычайные ситуации', 
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-800',
    description: 'Материалы по ЧС'
  },
  { 
    id: 'education', 
    title: 'Образование', 
    icon: <GraduationCap className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800',
    description: 'Учебные материалы'
  },
  { 
    id: 'protection', 
    title: 'Защита', 
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800',
    description: 'Средства и методы защиты'
  },
]

export default function Sidebar({ currentTopic }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [topicTitles, setTopicTitles] = useState<Record<number, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Определяем активный раздел из URL
  const activeSection = pathname.split('/')[1] || 'fires'

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsExpanded(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Загружаем заголовки тем
    async function loadTopicTitles() {
      try {
        const response = await fetch('/api/topics')
        if (response.ok) {
          const topics = await response.json()
          const titles: Record<number, string> = {}
          topics.forEach((topic: any) => {
            titles[topic.topic_number] = topic.title
          })
          setTopicTitles(titles)
        }
      } catch (error) {
        console.error('Failed to load topic titles:', error)
      }
    }

    loadTopicTitles()
  }, [])

  const renderTopicList = () => {
    return Array.from({ length: 26 }, (_, i) => {
      const topicId = i + 1
      const isActive = currentTopic === topicId
      const title = topicTitles[topicId] || `Тема ${topicId}`
      
      return (
        <Link
          key={topicId}
          href={`/topics/${topicId}`}
          className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive
              ? 'bg-red-50 text-red-700 font-medium border-l-4 border-red-500'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="font-mono text-xs mr-2 shrink-0 bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
            Т{topicId}
          </span>
          <span className="text-gray-600 truncate text-sm hover:text-gray-900">
            {title}
          </span>
        </Link>
      )
    })
  }

  // Для десктопа - обычный Sidebar
  return (
    <div 
      ref={sidebarRef}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 ${
        isExpanded ? 'w-full md:w-64' : 'w-16'
      }`}
    >
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
          aria-label={isExpanded ? "Свернуть меню" : "Развернуть меню"}
        >
          {isExpanded ? (
            <>
              <div className="flex items-center">
                <Book className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-semibold text-gray-900">Разделы</span>
              </div>
              <ChevronRight className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </>
          ) : (
            <Book className="w-5 h-5 text-red-600 mx-auto" />
          )}
        </button>
      </div>

      {/* Список разделов */}
      <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {isExpanded ? (
          <div className="space-y-2">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/${section.id}`}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-red-50 text-red-700 font-medium border-l-4 border-red-500'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${section.color.split(' ')[0]} flex items-center justify-center mr-3`}>
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{section.title}</div>
                  <div className="text-xs text-gray-500 truncate">{section.description}</div>
                </div>
              </Link>
            ))}
            
            {/* Разделитель */}
            <div className="my-4 border-t border-gray-200"></div>
            
            {/* Все темы раздела "Пожары" */}
            {activeSection === 'fires' && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-2 mb-2">
                  Темы по пожарной безопасности
                </h4>
                {renderTopicList()}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/${section.id}`}
                title={section.title}
                className={`flex items-center justify-center p-2 rounded-lg ${
                  activeSection === section.id
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {section.icon}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}