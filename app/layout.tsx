import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Безопасность в авиации - Образовательный портал',
  description: 'Интерактивный портал по безопасности в авиации: пожары, ЧС, образование, защита',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className}`}>
        {children}
      </body>
    </html>
  )
}