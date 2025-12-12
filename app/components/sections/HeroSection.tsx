// app/components/sections/HeroSection.tsx - УПРОЩЕННЫЙ
'use client'

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [heroText, setHeroText] = useState('Образовательная платформа по пожарной безопасности, чрезвычайным ситуациям и защите в авиации')

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Загружаем текст из localStorage
  useEffect(() => {
    const savedText = localStorage.getItem('heroText')
    if (savedText) {
      setHeroText(savedText)
    }
  }, [])

  return (
    <section className="relative linear-bg text-white min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Анимированный фон */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-r from-primary-400/30 to-blue-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-linear-to-r from-cyan-400/30 to-teal-400/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-white/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white to-transparent"></div>

      {/* Сетка */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-linear(90deg, transparent 95%, white 100%), linear-linear(0deg, transparent 95%, white 100%)`,
        backgroundSize: '40px 40px',
      }}></div>

      <div className="container relative mx-auto px-4 text-center z-10">
        {/* Бейдж */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-8 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium">Образовательный портал</span>
        </div>

        {/* Заголовок */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in">
          <span className="block">Безопасность</span>
          <span className="block text-linear bg-linear-to-r from-white to-red-200 bg-clip-text text-transparent">
            в авиации
          </span>
        </h1>

        {/* Подзаголовок (редактируемый текст) */}
        <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
          {heroText}
        </p>

        {/* Индикатор прокрутки */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <Shield className="w-6 h-6 text-white/60" />
        </div>
      </div>
    </section>
  )
}