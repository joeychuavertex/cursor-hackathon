import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shark Tank Simulator',
  description: 'Experience the thrill of pitching to AI-powered judges with realistic avatars and micro expressions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-shark-blue to-shark-dark">
          {children}
        </div>
      </body>
    </html>
  )
}
