"use client";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import mergeCarts from "@/utils/cart/mergeCarts";
import { createClient } from "@/utils/supabase/client";
import { CartCompleto } from "@/types/cart";
import Link from "next/link";
import CartCard from "@/components/cartCard";

export default function CarritoPage() {
    const cart = useCartStore((state) => state.cart);
    const showCart = useCartStore((state) => state.showCart);
    const showCartFunction = useCartStore((state) => state.showCartFunction);
    const addToCart = useCartStore((state) => state.addToCart);
    const substractToCart = useCartStore((state) => state.substractToCart);
    const syncCartToSupabase = useCartStore((state) => state.syncCartToSupabase);
    const setUserId = useCartStore((state) => state.setUserId);
    const loadCartFromSupabase = useCartStore((state) => state.loadCartFromSupabase);
    const supabase = createClient();
    const [productos, setProductos] = useState<CartCompleto[]>([]);

    useEffect(() => {
        //hallar los productos basados en los ids del carrito
        const ids = cart.map((item) => item.id);
        const fetchProductos = async function () {
            const { data, error } = await supabase
                .from('productos')
                .select('*')
                .in('id', ids);
            //buscar imagenes storage supabase y agregar quantity
            if (data) {
                data.forEach((item) => {
                    const cartItem = cart.find((cartItem) => cartItem.id === item.id);
                    item.imageUrl = supabase.storage.from('imagenes-jabones').getPublicUrl(item.image_path).data.publicUrl;
                    item.quantity = cartItem ? cartItem.quantity : 0;
                });
            }
            if (!error) setProductos(data);
        }
        if (cart.length > 0) {
            fetchProductos();
        } else {
            setProductos([]);
        }
    }, [cart, supabase]);
    return (
        <div className="flex  items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="flex-col flex-1">
                <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
                {
                    productos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-10">
                            <p className="text-gray-600">No hay productos en el carrito.</p>
                        </div>
                    ) : (
                        productos.map((productCart) => (
                            <CartCard key={productCart.id} productCart={productCart} />
                        ))
                    )
                }
            </div>
            <div className="w-[300px] self-start text-center">
                <h2 className="font-bold text-xl">Resumen de Compra</h2>
                <p className="text-gray-600 font-bold text-center">
                    {productos.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}€
                </p>
                <button className="bg-blue-500 text-white py-2 px-4 rounded">
                    Proceder a la Compra
                </button>
            </div>
        </div>
    )
}




