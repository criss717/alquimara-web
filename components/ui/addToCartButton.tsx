"use client"
import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import {CartItem} from "@/types/cart";

export default function AddToCartButton({ id }: Omit<CartItem, "quantity">) {
    const [isLoading, setIsLoading] = useState(false);
    const addToCart = useCartStore((state) => state.addToCart);
    const showCartFunction = useCartStore((state) => state.showCartFunction);
    const syncCartToSupabase = useCartStore((state) => state.syncCartToSupabase);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Evita que el click burbujee al Link
        e.preventDefault();  // Evita la navegación del Link si el botón está dentro
        setIsLoading(true);
        addToCart({ id });
        syncCartToSupabase(); // Sincronizar el carrito con Supabase
        showCartFunction(true); // Mostrar el carrito después de agregar el producto    
        setIsLoading(false);
    };
    return (
        <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={`bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600 transition-colors cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {isLoading ? "Añadiendo..." : (
                <>
                    Añadir al <LocalGroceryStoreIcon className="inline-block ml-1" />
                </>
            )}
        </button>
    );
}