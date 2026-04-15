import './globals.css'

export const metadata = {
  title: 'AV Learning - Context-Aware Mobile Learning',
  description: 'A prototype for learning in automated vehicles - CHI 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
