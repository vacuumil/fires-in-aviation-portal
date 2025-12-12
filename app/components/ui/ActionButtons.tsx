'use client'

import { LogIn, Download, BookOpen, Users, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ActionButtonsProps {
  variant?: 'primary' | 'secondary'
  showTeacherButton?: boolean
}

export default function ActionButtons({ variant = 'primary', showTeacherButton = true }: ActionButtonsProps) {
  const router = useRouter()

  const actions = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Начать обучение",
      description: "26 тем курса",
      action: () => router.push('/theory'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Download className="w-5 h-5" />,
      label: "Материалы",
      description: "PDF и презентации",
      action: () => alert('Функция в разработке'),
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Сообщество",
      description: "Форум и обсуждения",
      action: () => alert('Функция в разработке'),
      color: "from-purple-500 to-pink-500"
    }
  ]

  if (variant === 'primary') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={() => router.push('/theory')}
          className="group relative overflow-hidden bg-linear-to-r from-primary-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-blue-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3 min-w-[200px]"
        >
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <BookOpen className="w-5 h-5" />
          <span>Начать изучение</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {showTeacherButton && (
          <button 
            onClick={() => router.push('/admin/login')}
            className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            <span>Для преподавателей</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className="group relative overflow-hidden bg-white rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100"
        >
          {/* Фоновая градиентная полоса */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${action.color} transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300`} />
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-linear-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <div className="text-white">
                {action.icon}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{action.label}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-primary-600 font-medium text-sm">Перейти</span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      ))}
    </div>
  )
}