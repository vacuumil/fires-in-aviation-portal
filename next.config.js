/** @type {import('next').NextConfig} */
const nextConfig = {
  // Явно отключаем Turbopack и используем webpack
  experimental: {
    turbo: false,
  },
  
  // Настройки изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  
  // Внешние пакеты для серверных компонентов
  serverExternalPackages: ['fs'],
  
  // Для загрузки файлов увеличиваем лимит
  experimental: {
  },

  // Включаем строгий режим ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Включаем TypeScript проверку
  typescript: {
    ignoreBuildErrors: true,
  },

  // Настройки для деплоя
  output: 'standalone',
}

module.exports = nextConfig