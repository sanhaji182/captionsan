import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter, loaded via next/font for self-hosted, layout-shift-free rendering.
// Wired through the --font-inter variable consumed by --font-sans in
// globals.css. See docs/design/visual-direction.md.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CaptionSan',
  description: 'AI-assisted content writing for multiple platforms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-surface text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
