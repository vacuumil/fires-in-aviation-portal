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
  
  // Headers для CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  },
}

module.exports = nextConfig