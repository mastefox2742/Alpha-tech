import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from 'sonner';
import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Alpha tech',
  description: 'Plateforme de gestion — Alpha tech',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${jakarta.variable} ${dmMono.variable}`}>
        <AppProvider>
          {children}
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#121212',
                color: '#ffffff',
                border: '1px solid #222222',
              },
            }} 
          />
        </AppProvider>
      </body>
    </html>
  );
}
