import React from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
                {children}
            </main>
            <Footer />
        </div>
    );
};
