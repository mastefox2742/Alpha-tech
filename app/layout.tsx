import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Alpha tech',
  description: 'Plateforme de gestion — Alpha tech',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
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
