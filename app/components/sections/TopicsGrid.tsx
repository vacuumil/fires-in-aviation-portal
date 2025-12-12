'use client'

import Link from 'next/link'
import { Flame, AlertTriangle, GraduationCap, Shield, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const sections = [
  { 
    name: 'Пожары', 
    href: '/fires', 
    count: 26, 
    color: 'from-red-500 to-orange-500',
    icon: <Flame className="w-6 h-6" />,
    description: '26 тем по пожарной безопасности в авиации'
  },
  { 
    name: 'Чрезвычайные ситуации', 
    href: '/emergency', 
    count: 0, 
    color: 'from-orange-500 to-amber-500',
    icon: <AlertTriangle className="w-6 h-6" />,
    description: 'Действия при авиационных ЧС'
  },
  { 
    name: 'Образование', 
    href: '/education', 
    count: 0, 
    color: 'from-blue-500 to-cyan-500',
    icon: <GraduationCap className="w-6 h-6" />,
    description: 'Учебные материалы и методики обучения'
  },
  { 
    name: 'Защита', 
    href: '/protection', 
    count: 0, 
    color: 'from-green-500 to-emerald-500',
    icon: <Shield className="w-6 h-6" />,
    description: 'Средства и методы защиты в авиации'
  },
]

export default function TopicsGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sections.map((section, index) => (
        <Link
          key={section.name}
          href={section.href}
          className="group relative overflow-hidden"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className={`
            bg-white rounded-2xl p-6 
            transition-all duration-300 
            border border-gray-100
            hover:shadow-2xl
            hover:scale-[1.02]
            ${hoveredIndex === index ? 'shadow-xl scale-[1.02]' : 'shadow-md'}
            min-h-[250px] flex flex-col justify-between
          `}>
            {/* Анимированный фон */}
            <div 
              className={`absolute inset-0 bg-linear-to-br ${section.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="relative z-10">
              {/* Верхняя часть с иконкой и счетчиком */}
              <div className="flex items-start justify-between mb-6">
                <div className={`
                  w-14 h-14 rounded-xl 
                  bg-linear-to-br ${section.color} 
                  flex items-center justify-center
                  group-hover:scale-110 
                  transition-transform duration-300
                  shadow-lg
                `}>
                  <div className="text-white">
                    {section.icon}
                  </div>
                </div>
                
                {section.count > 0 && (
                  <div className={`
                    px-3 py-1.5 rounded-full 
                    bg-linear-to-r ${section.color} 
                    bg-opacity-10
                    group-hover:bg-opacity-20
                    transition-all duration-300
                    border border-transparent
                    group-hover:border-opacity-30
                  `}>
                    <span className="text-sm font-bold bg-linear-to-r ${section.color} bg-clip-text text-transparent">
                      {section.count} тем
                    </span>
                  </div>
                )}
              </div>

              {/* Заголовок и описание */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                {section.name}
              </h3>
              
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {section.description}
              </p>
            </div>

            {/* Нижняя часть с кнопкой */}
            <div className="relative z-10">
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-transparent transition-colors">
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                  {section.count > 0 ? 'Изучить раздел' : 'Скоро будут материалы'}
                </span>
                <div className={`
                  w-8 h-8 rounded-full 
                  ${section.count > 0 ? `bg-linear-to-r ${section.color}` : 'bg-gray-200'} 
                  flex items-center justify-center
                  group-hover:w-10 group-hover:h-10
                  transition-all duration-300
                `}>
                  <ArrowRight className={`w-4 h-4 ${section.count > 0 ? 'text-white' : 'text-gray-400'} group-hover:w-5 group-hover:h-5 transition-all`} />
                </div>
              </div>
            </div>

            {/* Анимированная полоска снизу */}
            <div className={`
              absolute bottom-0 left-0 right-0 h-1 
              ${section.count > 0 ? `bg-linear-to-r ${section.color}` : 'bg-gray-300'}
              transform translate-y-full
              group-hover:translate-y-0
              transition-transform duration-300
            `} />
          </div>

          {/* Эффект при наведении */}
          {hoveredIndex === index && section.count > 0 && (
            <div 
              className={`
                absolute inset-0 rounded-2xl 
                bg-linear-to-r ${section.color} 
                opacity-10 blur-xl
                -z-10
              `}
            />
          )}
        </Link>
      ))}
    </div>
  )
}