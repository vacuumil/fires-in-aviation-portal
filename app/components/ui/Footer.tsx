// app/components/ui/Footer.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client'

import { Heart, Shield, Lock, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface SectionStats {
  fires: number
  emergency: number
  education: number
  protection: number
  total: number
}

export default function Footer() {
  const [stats, setStats] = useState<SectionStats>({
    fires: 0,
    emergency: 0,
    education: 0,
    protection: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const sections = ['fires', 'emergency', 'education', 'protection']
      const counts: Record<string, number> = {}
      let total = 0
      
      for (const section of sections) {
        try {
          const res = await fetch(`/api/github/topics?section=${section}`, {
            next: { revalidate: 60 }
          })
          if (res.ok) {
            const data = await res.json()
            counts[section] = data.length
            total += data.length
          } else {
            counts[section] = 0
          }
        } catch (error) {
          console.error(`Failed to load stats for ${section}:`, error)
          counts[section] = 0
        }
      }
      
      setStats({
        fires: counts.fires || 0,
        emergency: counts.emergency || 0,
        education: counts.education || 0,
        protection: counts.protection || 0,
        total
      })
    } catch (error) {
      console.error('Failed to load footer stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadStats()
  }, [])

  const sections = [
    { 
      name: "Пожары", 
      href: "/fires", 
      count: stats.fires, 
      icon: "🔥",
      linear: "from-red-500 to-orange-500",
      bgColor: "bg-linear-to-br from-red-500/10 to-orange-500/10"
    },
    { 
      name: "Чрезвычайные ситуации", 
      href: "/emergency", 
      count: stats.emergency, 
      icon: "⚠️",
      linear: "from-orange-500 to-amber-500",
      bgColor: "bg-linear-to-br from-orange-500/10 to-amber-500/10"
    },
    { 
      name: "Образование", 
      href: "/education", 
      count: stats.education, 
      icon: "🎓",
      linear: "from-blue-500 to-cyan-500",
      bgColor: "bg-linear-to-br from-blue-500/10 to-cyan-500/10"
    },
    { 
      name: "Защита", 
      href: "/protection", 
      count: stats.protection, 
      icon: "🛡️",
      linear: "from-green-500 to-emerald-500",
      bgColor: "bg-linear-to-br from-green-500/10 to-emerald-500/10"
    },
  ]

  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Карточки разделов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sections.map((section) => (
            <Link 
              key={section.name}
              href={section.href}
              className="group relative overflow-hidden bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl"
            >
              {/* Верхняя часть с иконкой и счетчиком */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${section.linear} flex items-center justify-center`}>
                  <span className="text-2xl">{section.icon}</span>
                </div>
                <span className="text-sm bg-gray-700/50 text-white px-3 py-1.5 rounded-full">
                  {loading ? '...' : section.count} тем
                </span>
              </div>
              
              {/* Название раздела */}
              <h3 className="font-bold text-white text-xl mb-3">{section.name}</h3>
              
              {/* Индикатор при наведении */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700 group-hover:border-gray-600 transition-colors">
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Открыть раздел
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Центральный информационный блок */}
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Иконка */}
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Текст и кнопка */}
            <div className="flex-1">
              <p className="text-gray-300 leading-relaxed mb-6 text-center md:text-left">
                Образовательный ресурс по безопасности в авиации. 
                Все материалы представлены в учебных целях. Для получения профессиональных 
                консультаций обратитесь к специалистам.
              </p>
              
              <div className="flex justify-center md:justify-start">
                <Link 
                  href="/admin"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Для преподавателя</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Копирайт и информация */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-linear-to-r from-red-500 to-orange-500">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Образовательный портал по безопасности в авиации</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Все материалы представлены в учебных целях
              </p>
            </div>
            
            {/* Бейджи */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Безопасный доступ</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Образовательный проект</span>
              </div>
            </div>
          </div>
          
          {/* Финальная строка */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
                <span className="text-sm text-gray-400">
                  Сделано с ❤️ для образования
                </span>
              </div>
              
              <p className="text-sm text-gray-500">
                Проект включает темы по пожарам, ЧС, образованию и защите в авиации
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}