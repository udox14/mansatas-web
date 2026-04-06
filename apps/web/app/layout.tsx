import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: {
    default: 'MAN 1 Tasikmalaya',
    template: '%s | MAN 1 Tasikmalaya',
  },
  description: 'Website Resmi Madrasah Aliyah Negeri 1 Tasikmalaya — Singaparna. Unggul dalam Iman, Ilmu, dan Amal.',
  keywords: ['MAN 1 Tasikmalaya', 'Madrasah Aliyah', 'Singaparna', 'Sekolah Islam', 'PPDB'],
  openGraph: {
    title: 'MAN 1 Tasikmalaya',
    description: 'Madrasah Aliyah Negeri 1 Tasikmalaya — Singaparna',
    type: 'website',
    locale: 'id_ID',
  },
}

// Inline script to prevent dark mode flash
const darkModeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body className="font-body antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
