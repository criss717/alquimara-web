//componente para la tarjeta de producto
"use client";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

type CardProductProps = {
    imageUrl: string;
    productName: string;
    productPrice: number;
    id: string;
    description?: string;
    stock?: number;
};

export default function CardProduct({ imageUrl, productName, productPrice, id, description, stock }: CardProductProps) {
    const [isLoading, setIsLoading] = useState(false);
    const addToCart = useCartStore((state) => state.addToCart);
    const showCartFunction = useCartStore((state) => state.showCartFunction);
    const syncCartToSupabase = useCartStore((state) => state.syncCartToSupabase);

    const handleAddToCart = async (e:React.MouseEvent) => {
        e.stopPropagation(); // Evita que el click burbujee al Link
        e.preventDefault();  // Evita la navegación del Link si el botón está dentro
        setIsLoading(true);
        addToCart({
            imageUrl,
            productName,
            productPrice,
            id,
            description,
            stock,
        });
        syncCartToSupabase(); // Sincronizar el carrito con Supabase
        showCartFunction(true); // Mostrar el carrito después de agregar el producto    
        setIsLoading(false);
    };

    return (
        <Link href={`/productos/${id}`}>
            <div className="w-full h-100 border rounded-xl p-2 flex flex-col items-center justify-center">
                <div className="w-64 h-64 relative">
                    <Image
                        src={imageUrl}
                        alt={productName}
                        fill
                        className="object-cover rounded-full p-3"
                    />
                </div>
                <h3 className="text-lg font-bold mt-2">{productName}</h3>
                <p className="text-sm text-gray-600">{productPrice}€</p>
                <button
                    onClick={handleAddToCart}
                    disabled={isLoading}
                    className={`mt-2 px-4 py-2 bg-violet-800 hover:bg-violet-400 cursor-pointer text-white rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isLoading ? "Añadiendo..." : "Añadir al 🛒"}
                </button>
            </div>
        </Link>

    );
}