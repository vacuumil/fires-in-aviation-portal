// app/(main)/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client'

import HeroSection from '@/app/components/sections/HeroSection'
import { useRouter } from 'next/navigation'
import { Flame, AlertTriangle, BookOpen, Shield, Search, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const mainSections = [
    { 
      title: "Пожары", 
      description: "Изучение пожарной безопасности в авиации", 
      href: "/fires", 
      color: "from-red-500 to-orange-500",
      icon: <Flame className="w-8 h-8" />,
      count: 26
    },
    { 
      title: "Чрезвычайные ситуации", 
      description: "Действия при авиационных ЧС", 
      href: "/emergency", 
      color: "from-orange-500 to-amber-500",
      icon: <AlertTriangle className="w-8 h-8" />,
      count: 0
    },
    { 
      title: "Образование", 
      description: "Учебные материалы и методики обучения", 
      href: "/education", 
      color: "from-blue-500 to-cyan-500",
      icon: <BookOpen className="w-8 h-8" />,
      count: 0
    },
    { 
      title: "Защита", 
      description: "Средства и методы защиты в авиации", 
      href: "/protection", 
      color: "from-green-500 to-emerald-500",
      icon: <Shield className="w-8 h-8" />,
      count: 0
    },
  ]

  return (
    <>
      <HeroSection />
      
      {/* Декоративные элементы */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-linear-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-40 left-0 w-96 h-96 bg-linear-to-r from-blue-500/10 to-green-500/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 py-16 relative">
        {/* Основные разделы */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-linear-to-r from-red-100 to-orange-100 text-red-700 text-sm font-semibold mb-4">
              🚀 Основные направления
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Четыре основных раздела
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Изучайте материалы по всем аспектам безопасности в авиации
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mainSections.map((section, index) => (
              <div 
                key={index}
                onClick={() => router.push(section.href)}
                className={`bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] border border-gray-100 relative overflow-hidden min-h-[250px] flex flex-col justify-between`}
              >
                {/* Декоративный фон */}
                <div className={`absolute inset-0 bg-linear-to-br ${section.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">
                        {section.icon}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full bg-linear-to-r ${section.color} bg-opacity-10`}>
                      <span className={`text-lg font-bold bg-linear-to-r ${section.color} bg-clip-text text-transparent`}>
                        {section.count} тем
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">{section.title}</h3>
                  <p className="text-gray-600">{section.description}</p>
                </div>
                
                <div className="relative z-10 mt-6 pt-6 border-t border-gray-200 group-hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Открыть раздел
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Поиск */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-red-500/10 to-orange-500/10 mb-6">
                <Search className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-semibold">Поиск по сайту</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Найдите нужную тему быстро
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Используйте поиск по всему контенту сайта или перейдите в нужный раздел для изучения материалов.
              </p>
              <button
                onClick={() => {
                  const searchBtn = document.querySelector('[aria-label="Поиск по сайту"]') as HTMLElement
                  searchBtn?.click()
                }}
                className="group bg-linear-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3 mx-auto"
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Search className="w-5 h-5" />
                <span>Открыть поиск по сайту</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}