// Componente para la barra de búsqueda
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchProducts() {
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    const handleSearch = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Navega a la página de búsqueda con el término ingresado
            router.push(`/products/search/${searchTerm}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-l px-4 py-2 w-full"
            />
            <button type="submit" className="bg-blue-500 mx-2 text-white rounded-r px-4 py-2">
                Buscar
            </button>
        </form>
    );
}