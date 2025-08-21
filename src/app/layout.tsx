import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EquiRank - Your Financial Partner',
  description: 'Connect with borrowers and lenders in a secure, transparent financial marketplace.',
  icons: {
    icon: '/EquiRank.png',
    shortcut: '/EquiRank.png',
    apple: '/EquiRank.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
})
{
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <NextAuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  )
}
