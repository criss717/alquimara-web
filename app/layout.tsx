import React from 'react';
import './styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
    title: 'Alquimara',
    description: 'Tu tienda de productos naturales y orgánicos',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const currentYear = new Date().getFullYear(); // Calcular el año en el servidor

    return (
        <html lang="es" className="h-full">
            <body className="flex flex-col min-h-screen bg-gray-50">
                <Navbar />
                <main className="pt-36 flex-1  ">{children}</main>
                <footer className="bg-gray-800 text-white py-4 text-center">
                    &copy; {currentYear} Alquimara. Todos los derechos reservados.
                </footer>
            </body>
        </html>
    );
}