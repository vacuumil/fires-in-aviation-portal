'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import Cookies from 'js-cookie'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      Cookies.remove('admin-auth')
      router.push('/admin/login')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Выйти
    </button>
  )
}
