export interface NavItem {
  title: string
  href: string
  description?: string
  icon?: string
  color: string
  count?: number
}

export const mainNavigation: NavItem[] = [
  {
    title: 'Пожары',
    href: '/fires',
    description: 'Темы по пожарной безопасности в авиации',
    color: 'bg-red-100'
  },
  {
    title: 'Чрезвычайные ситуации',
    href: '/emergency',
    description: 'Действия при ЧС в авиации',
    color: 'bg-orange-100'
  },
  {
    title: 'Образование',
    href: '/education',
    description: 'Учебные материалы и методики',
    color: 'bg-blue-100'
  },
  {
    title: 'Защита',
    href: '/protection',
    description: 'Средства и методы защиты',
    color: 'bg-green-100'
  }
]