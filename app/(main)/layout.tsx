import Header from '@/app/components/ui/Header'
import Footer from '@/app/components/ui/Footer'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="grow">
        {children}
      </main>
      <Footer />
    </>
  )
}