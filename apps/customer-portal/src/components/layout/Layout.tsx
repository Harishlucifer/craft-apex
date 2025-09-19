import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      <Header />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
};