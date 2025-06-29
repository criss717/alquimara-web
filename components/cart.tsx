"use client";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import mergeCarts from "@/utils/cart/mergeCarts";
import { createClient } from "@/utils/supabase/client";
import {CartCompleto} from "@/types/cart";
import Link from "next/link";

type CartProps = {
    user: User | null;
}

export default function CartSidebar({ user }: CartProps) {
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
        if (user?.id) {
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
    }, [user?.id, setUserId, loadCartFromSupabase, syncCartToSupabase]);

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
        }else{
            setProductos([]);
        }
    }, [cart, supabase]);


    console.log("Productos:", productos);

    return (
        <aside className={`fixed overflow-y-scroll right-0 top-0 w-[200px] bg-[#fff2f2] h-full shadow-lg z-50 p-4 ${showCart ? "block" : "hidden"}`}>
            <div className="w-full flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-center">Carrito</h2>
                <button
                    onClick={() => showCartFunction(false)}
                    className="text-violet-500 hover:text-violet-900 transition duration-300 cursor-pointer"
                >
                    <VisibilityOffIcon />
                </button>
            </div>
            {productos.length === 0 ? (
                <p>El carrito está vacío.</p>
            ) : (
                <ul>
                    {productos.map((item) => (
                        <li key={item.name + item.price} className="mb-2 border-b-2 border-b-violet-200 w-full h-full flex flex-col justify-between items-center">
                            <Link href={`/productos/${item.slug}`} className="w-full h-full" key={item.id}>
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={125}
                                    height={125}
                                    className="object-cover rounded-full p-3"
                                />
                            </Link>
                            <span>{item.price} €</span>
                            <div className="flex items-center justify-between w-full mb-2">
                                {item.quantity < 2 ?
                                    <button
                                        onClick={() => substractToCart(item)}
                                        className="text-red-500 hover:text-red-700 transition duration-300 cursor-pointer"
                                    >
                                        <RemoveShoppingCartIcon />
                                    </button>
                                    : <button
                                        onClick={() => substractToCart(item)}
                                        className="text-red-500 hover:text-red-700 transition duration-300 cursor-pointer text-bold text-xl"
                                    >
                                        -
                                    </button>
                                }

                                <span className="font-bold">{item.quantity}</span>
                                <button
                                    onClick={() => {
                                        addToCart({ id: item.id });
                                    }}
                                    className="text-violet-500 hover:text-violet-700 transition duration-300 text-bold text-2xl cursor-pointer"
                                >
                                    +
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}