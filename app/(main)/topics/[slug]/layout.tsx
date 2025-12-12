import Sidebar from '@/app/components/ui/Sidebar'

export default async function TopicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  // Распаковываем Promise из params
  const { slug } = await params
  const currentTopic = parseInt(slug)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Sidebar currentTopic={currentTopic} />
        </div>
        
        {/* Main Content */}
        <div className="lg:w-3/4">
          {children}
        </div>
      </div>
    </div>
  )
}