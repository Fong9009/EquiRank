import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Script from 'next/script'
import { headers } from 'next/headers'
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
})
{
  const h = await headers();
  const nonce = h.get('x-nonce') || undefined;
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <NextAuthProvider>
          <Script
            id="recaptcha-api"
            src="https://www.google.com/recaptcha/api.js"
            strategy="afterInteractive"
            nonce={nonce}
            async
            defer
          />
          <Navbar />
          <main>
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  )
}
