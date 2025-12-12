// app/components/ui/Header.tsx - ИСПРАВЛЕННЫЙ И ОПТИМИЗИРОВАННЫЙ
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, BookOpen, Search as SearchIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Search from './Search'

const navigation = [
  { name: 'Пожары', href: '/fires' },
  { name: 'Чрезвычайные ситуации', href: '/emergency' },
  { name: 'Образование', href: '/education' },
  { name: 'Защита', href: '/protection' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const pathname = usePathname()

  // Обработка скролла - упрощенная версия
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Закрытие меню при изменении маршрута
  useEffect(() => {
    setIsOpen(false)
    setShowSearch(false)
  }, [pathname])

  // Закрытие при нажатии ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setShowSearch(false)
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-200
        ${isScrolled 
          ? 'bg-white shadow-sm py-2 border-b border-gray-200' 
          : 'bg-white py-3'
        }
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Логотип */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group shrink-0 min-w-0"
              onClick={() => {
                setIsOpen(false)
                setShowSearch(false)
              }}
            >
              <div className={`
                p-2 rounded-xl transition-all duration-200
                bg-red-600
                group-hover:scale-105
                group-hover:shadow-sm
              `}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-red-700 transition-colors">
                  Безопасность в авиации
                </h1>
                <p className="text-xs text-gray-600 truncate">
                  Образовательный портал
                </p>
              </div>
              <div className="sm:hidden min-w-0">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Безопасность в авиации
                </h1>
              </div>
            </Link>

            {/* Навигация для десктопа */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                      flex items-center gap-2 transition-all duration-200
                      ${isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      }
                    `}
                    onClick={() => {
                      setIsOpen(false)
                      setShowSearch(false)
                    }}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-red-600 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Правый блок с кнопками */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Кнопка поиска */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Поиск по сайту"
              >
                <SearchIcon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Кнопка меню для мобильных */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Мобильное меню */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg animate-fade-in">
            <div className="container mx-auto px-4 py-3">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center justify-center px-4 py-3 rounded-xl
                        transition-colors ${isActive
                          ? 'bg-red-50 text-red-700 font-semibold'
                          : 'hover:bg-gray-50 text-gray-700'
                        }
                      `}
                    >
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Модальное окно поиска */}
      {showSearch && (
        <div 
          className="fixed inset-0 bg-black/50 z-100 flex items-start justify-center pt-20 px-4"
          onClick={() => setShowSearch(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Search variant="modal" onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
      
      {/* Отступ для фиксированного хедера */}
      <div className={`transition-all duration-200 ${isScrolled ? 'h-16' : 'h-20'}`}></div>
    </>
  )
}