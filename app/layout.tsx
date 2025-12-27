import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'CozyRoom',
  description: '完全招待制のブログ',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'CozyRoom',
    description: '完全招待制のブログ',
    images: [
      {
        url: '/ogp-default.png',
        width: 1200,
        height: 630,
        alt: 'CozyRoom',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

