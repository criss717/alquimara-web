import React from 'react';
import './styles/globals.css';
import Navbar from '@/components/Navbar';
import { Comic_Neue } from "next/font/google";
import CartSidebar from '@/components/CartSidebar';
import { createClient } from "@/utils/supabase/server";

export const metadata = {
    title: 'Alquimara',
    description: 'Tu tienda de productos naturales y orgánicos',
};

const great = Comic_Neue({
    subsets: ["latin"],
    weight: '400'
});

export default async function Layout({ children }: { children: React.ReactNode }) {
    const currentYear = new Date().getFullYear(); // Calcular el año en el servidor
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <html lang="es" className={`h-full`}>
            <body className={`flex flex-col min-h-screen ${great.className} text-l`}>
                <Navbar user={user} />
                <main className="pt-24 flex-1 bg-[#fff2f2]">{children}</main>
                <CartSidebar user={user} />
                <footer className="bg-gray-800 text-white py-4 text-center">
                    &copy; {currentYear} Alquimara. Todos los derechos reservados.
                </footer>
            </body>
        </html>
    );
}