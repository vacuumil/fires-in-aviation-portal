// app/components/ui/Header.tsx - ИСПРАВЛЕННЫЙ
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

  // Обработка скролла
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Закрытие меню при изменении маршрута
  useEffect(() => {
    setIsOpen(false)
    setShowSearch(false)
  }, [pathname])

  // Закрытие меню при клике вне области
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsOpen(false)
      }
      if (showSearch && !target.closest('.search-modal') && !target.closest('.search-button')) {
        setShowSearch(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen, showSearch])

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-300 backdrop-blur-md
        ${isScrolled 
          ? 'bg-white/95 shadow-lg py-2 border-b border-gray-200' 
          : 'bg-white/90 py-3'
        }
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Логотип - всегда ведет на главную */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group shrink-0 min-w-0"
            >
              <div className={`
                p-2 rounded-xl transition-all duration-300
                ${isScrolled 
                  ? 'bg-red-600' 
                  : 'bg-linear-to-r from-red-600 to-orange-600'
                }
                group-hover:scale-105
                group-hover:shadow-md
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
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                    flex items-center gap-2 transition-all duration-300
                    ${pathname === item.href
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }
                  `}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Правый блок с кнопками */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Кнопка поиска */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors search-button"
                aria-label="Поиск по сайту"
              >
                <SearchIcon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Кнопка меню для мобильных */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden menu-button p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="lg:hidden mobile-menu absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg animate-fade-in">
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-center px-4 py-3 rounded-xl
                      transition-colors ${pathname === item.href
                        ? 'bg-red-50 text-red-700'
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Модальное окно поиска */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-100 flex items-start justify-center pt-20 px-4 search-modal">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Search variant="modal" onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
      
      {/* Отступ для фиксированного хедера */}
      <div className="h-16 lg:h-20"></div>
    </>
  )
}