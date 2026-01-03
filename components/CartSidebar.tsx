"use client";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import mergeCarts from "@/utils/cart/mergeCarts";
import { createClient } from "@/utils/supabase/client";
import { CartCompleto } from "@/types/cart";
import Link from "next/link";
import CantidadComponent from "./cantidadComponent";
import { usePathname } from "next/navigation";
import SidebarCartSkeleton from './SidebarCartSkeleton';
import { load } from "@/utils/utils";

type CartProps = {
    user: User | null;
}

export default function CartSidebar({ user }: CartProps) {
    const cart = useCartStore((state) => state.cart);
    const showCart = useCartStore((state) => state.showCart);
    const showCartFunction = useCartStore((state) => state.showCartFunction);
    const syncCartToSupabase = useCartStore((state) => state.syncCartToSupabase);
    const setUserId = useCartStore((state) => state.setUserId);
    const loadCartFromSupabase = useCartStore((state) => state.loadCartFromSupabase);
    const supabase = createClient();
    const [productos, setProductos] = useState<CartCompleto[]>([]);
    const [loading, setLoading] = useState(false);
    const prevIdsRef = useRef<string>("");
    const url = usePathname();

    useEffect(() => {
        //asegurar que solo hace merge al hacer login por primera vez
        //conseguimos el id del usuario del local storage
        const IdUserLocal = useCartStore.getState().userId;
        if (user?.id && user.id !== IdUserLocal) {
            setUserId(user.id);
            // 1. Guarda el carrito local ANTES de cargar el de Supabase
            const localCart = useCartStore.getState().cart;
            // 2. Carga el carrito de Supabase y luego fusiona
            loadCartFromSupabase().then(() => {
                const supabaseCart = useCartStore.getState().cart; // Ahora es el de Supabase
                const mergedCart = mergeCarts(localCart, supabaseCart);
                useCartStore.setState({ cart: mergedCart });
                syncCartToSupabase();
            });
        }
        return () => {
            showCartFunction(false);
        };
    }, [user?.id, setUserId, syncCartToSupabase, loadCartFromSupabase, showCartFunction]);

    useEffect(() => {
        load(cart, setProductos, prevIdsRef, setLoading, supabase);
    }, [cart, supabase]);

    return (
        <aside className={`fixed overflow-y-hidden right-0 top-0 w-[200px] bg-white h-full shadow-lg z-50 p-4 ${showCart && cart.length > 0 ? "block" : "hidden"} ${url.startsWith('/productos') || url == '/' ? "block" : "hidden"}`}>
            <div className="w-full flex flex-col justify-between items-center mb-4 gap-2">
                <div className="flex justify-evenly w-full">
                    <h2 className="font-bold text-xl">Sub total</h2>
                    <button
                        onClick={() => showCartFunction(false)}
                        className="text-violet-500 hover:text-violet-900 transition duration-300 cursor-pointer"
                    >
                        <VisibilityOffIcon />
                    </button>

                </div>
                {
                    productos.length === 0 ? (
                        <div className="animate-pulse h-6 bg-gray-200 rounded w-1/5" />
                    ) : (
                        <p className="text-gray-600 font-bold text-center">
                            {productos.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}€
                        </p>
                    )
                }
                <Link href="/carrito">
                    <button
                        className="border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white transition duration-300 cursor-pointer py-1 px-2 rounded"
                    >
                        Ir a la cesta
                    </button>
                </Link>
            </div>
            {loading ? (
                <SidebarCartSkeleton count={cart.length} />
            ) : productos.length === 0 ? (
                <p>El carrito está vacío.</p>
            ) : (
                <ul>
                    {productos.map((item) => (
                        <li key={item.name + item.price} className="mb-2 border-b-2 border-b-violet-200 w-full h-full flex flex-col justify-between items-center">
                            <Link href={`/productos/${item.slug}`} className="w-full h-full flex justify-center" key={item.id}>
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={125}
                                    height={125}
                                    className="rounded-full p-3"
                                />
                            </Link>
                            <span>{item.price} €</span>
                            <CantidadComponent item={item} />
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}