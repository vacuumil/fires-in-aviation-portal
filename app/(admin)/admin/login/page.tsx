'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import Cookies from 'js-cookie'

// Компонент формы входа
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const from = searchParams.get('from') || '/admin'

  // Проверяем, уже авторизованы ли
  useEffect(() => {
    const authCookie = Cookies.get('admin-auth')
    if (authCookie === 'authenticated') {
      router.push(from)
    }
  }, [router, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // Проверяем учетные данные - ИЗМЕНЕН ПАРОЛЬ
      if (username === 'admin' && password === 'yulianailya2025') {
        // Сохраняем в куки на 1 день
        Cookies.set('admin-auth', 'authenticated', { expires: 1 })
        setSuccess(true)
        
        // Редирект
        setTimeout(() => {
          router.push(from)
        }, 800)
      } else {
        setError('Неверное имя пользователя или пароль')
      }
    } catch (err) {
      setError('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Вход в админ-панель
        </h1>
        <p className="text-gray-600">
          Образовательный портал "Пожары в авиации"
        </p>
      </div>

      {/* Форма входа */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя пользователя
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Сообщения */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-600">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-600">Успешный вход! Перенаправление...</span>
            </div>
          </div>
        )}

        {/* Подсказка */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Тестовые учетные данные:</strong><br />
            Логин: <code>admin</code><br />
            Пароль: <code>yulianailya2025</code>
          </p>
        </div>

        {/* Кнопка входа */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Вход...
            </div>
          ) : (
            'Войти'
          )}
        </button>
      </form>
    </div>
  )
}

// Fallback компонент
function LoginFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Вход в админ-панель
        </h1>
        <p className="text-gray-600">
          Образовательный портал "Пожары в авиации"
        </p>
      </div>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  )
}

// Основной компонент страницы
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
        
        {/* Информация о сайте */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Образовательный портал "Пожары в авиации" © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}