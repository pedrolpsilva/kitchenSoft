import type { Metadata } from 'next';
import './globals.css';
import { AuthListener } from '@/components/providers/AuthListener';

export const metadata: Metadata = {
  title: 'PedroLPS KDS — Kitchen Display System',
  description:
    'Engine operacional para cozinhas e restaurantes. Sistema de display tático para estações de preparo com comunicação em tempo real.',
  keywords: ['KDS', 'Kitchen Display', 'PedroLPS', 'restaurante', 'cozinha'],
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-gray-50 overflow-hidden">
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
