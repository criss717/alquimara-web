import { create } from "zustand";
import { persist } from "zustand/middleware"; // Importa persist para almacenar el estado en localStorage
import { saveCartToSupabase, loadCartFromSupabase } from "@/utils/supabase/cartSupabase";
import {  CartItem } from "@/types/cart";

type CartState = {
    cart: CartItem[];
    showCart: boolean;
    userId?: string; // Opcional, para sincronizar con Supabase
    setUserId: (userId: string) => void;
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    substractToCart: (item: Omit<CartItem, "quantity">) => void;
    showCartFunction: (show: boolean) => void;
    clearCart: (items: string[]) => void;
    syncCartToSupabase: () => Promise<void>;
    loadCartFromSupabase: () => Promise<void>;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            showCart: false,
            addToCart: (item) => {
                set((state) => {
                    const existing = state.cart.find((i) => i.id === item.id);
                    let newCart;
                    if (existing) {
                        newCart = state.cart.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        );
                    } else {
                        newCart = [...state.cart, { ...item, quantity: 1 }];
                    }
                    return { cart: newCart };
                })
                // Sincroniza después de actualizar el carrito
                setTimeout(() => get().syncCartToSupabase(), 0);
            },
            substractToCart: (item) => {
                set((state) => {
                    const existing = state.cart.find((i) => i.id === item.id);
                    let newCart = state.cart;
                    if (existing && existing.quantity > 1) {
                        newCart = state.cart.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity - 1 }
                                : i
                        );
                    } else if (existing && existing.quantity === 1) {
                        newCart = state.cart.filter((i) => i.id !== item.id);
                    }
                    // Sincroniza después de actualizar el carrito
                    return { cart: newCart };
                })
                setTimeout(() => get().syncCartToSupabase(), 0);
            },
            showCartFunction: (show) => set(() => ({
                showCart: show,
            })),
            clearCart: (items) => {
                //borra los elementos pasados del carrito, cuando hace la compra           
                const cartActual = useCartStore.getState().cart;
                console.log(items, cartActual);
                set(() => ({
                    cart: cartActual.filter(item => !items.includes(item.id.toString())),
                }));
                // Sincroniza después de actualizar el carrito
                setTimeout(() => get().syncCartToSupabase(), 0);
            },
            setUserId: (userId) => set({ userId }),
            syncCartToSupabase: async () => {
                const { userId, cart } = get();
                if (userId) await saveCartToSupabase(userId, cart);
            },
            loadCartFromSupabase: async () => {
                const { userId } = get();
                if (userId) {
                    const cart = await loadCartFromSupabase(userId);
                    set({ cart });
                }
            },
        }),
        {
            name: "cart-storage", // nombre de la clave en localStorage
            partialize: (state) => ({ cart: state.cart, showCart: state.showCart, userId: state.userId }), // solo persiste el carrito
        }
    )
);