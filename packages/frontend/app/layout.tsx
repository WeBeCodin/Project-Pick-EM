import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layouts/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFL Pick \'Em Challenge',
  description: 'Test your NFL knowledge and compete with friends in the ultimate football prediction game.',
  keywords: 'NFL, football, predictions, picks, sports, betting, fantasy',
  authors: [{ name: 'NFL Pick \'Em Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
