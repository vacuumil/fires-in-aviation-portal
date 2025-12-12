import Header from '@/app/components/ui/Header'
import FooterServer from '@/app/components/ui/FooterServer'

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
      <FooterServer />
    </>
  )
}