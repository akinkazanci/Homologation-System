import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { CertificatesProvider } from '@/lib/certificates-store'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Daiichi Infotainment Systems — Homologation & Certificate Portal',
  description:
    'Browse, filter and download Daiichi Infotainment Systems product homologation certificates by product family. Corporate certificate management portal.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const shouldEnableAnalytics = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'

  return (
    <html lang="en" className={`light bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <CertificatesProvider>{children}</CertificatesProvider>
        {shouldEnableAnalytics && <Analytics />}
      </body>
    </html>
  )
}
