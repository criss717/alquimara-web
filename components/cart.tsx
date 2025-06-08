"use client";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import mergeCarts from "@/utils/cart/mergeCarts";

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

    useEffect(() => {
        if (user?.id) {
            setUserId(user.id);
            // 1. Guarda el carrito local ANTES de cargar el de Supabase
            const localCart = useCartStore.getState().cart;
            // 2. Carga el carrito de Supabase y luego fusiona
            loadCartFromSupabase().then(() => {
                const supabaseCart = useCartStore.getState().cart; // Ahora es el de Supabase
                const mergedCart = mergeCarts(localCart,supabaseCart);
                useCartStore.setState({ cart: mergedCart });
                syncCartToSupabase();
            });
        }
    }, [user?.id, setUserId, loadCartFromSupabase, syncCartToSupabase]);


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
            {cart.length === 0 ? (
                <p>El carrito está vacío.</p>
            ) : (
                <ul>
                    {cart.map((item) => (
                        <li key={item.productName + item.productPrice} className="mb-2 border-b-2 border-b-violet-200 w-full h-full flex flex-col justify-between items-center">
                            <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                width={125}
                                height={125}
                                className="object-cover rounded-full p-3"
                            />
                            <span>{item.productPrice} €</span>
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
                                        addToCart(item)
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