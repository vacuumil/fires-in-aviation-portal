// app/components/ui/HeaderSkeleton.tsx
export default function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="hidden sm:block">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse lg:hidden"></div>
          </div>
        </div>
      </div>
    </header>
  )
}