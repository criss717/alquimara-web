import { create } from "zustand";
import { persist } from "zustand/middleware"; // Importa persist para almacenar el estado en localStorage
import { saveCartToSupabase, loadCartFromSupabase } from "@/utils/supabase/cartSupabase";
import CartItem from "@/types/cart";

type CartState = {
    cart: CartItem[];
    showCart: boolean;
    userId?: string; // Opcional, para sincronizar con Supabase
    setUserId: (userId: string) => void;
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    substractToCart: (item: Omit<CartItem, "quantity">) => void;
    showCartFunction: (show: boolean) => void;
    clearCart: () => void;
    syncCartToSupabase: () => Promise<void>;
    loadCartFromSupabase: () => Promise<void>;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            showCart: false,
            addToCart: (item) =>
                set((state) => {
                    const existing = state.cart.find((i) => i.productName === item.productName);
                    let newCart;
                    if (existing) {
                        newCart = state.cart.map((i) =>
                            i.productName === item.productName
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        );
                    } else {
                        newCart = [...state.cart, { ...item, quantity: 1 }];
                    }
                    // Sincroniza después de actualizar el carrito
                    setTimeout(() => get().syncCartToSupabase(), 0);
                    return { cart: newCart };
                }),
            substractToCart: (item) =>
                set((state) => {
                    const existing = state.cart.find((i) => i.productName === item.productName);
                    let newCart = state.cart;
                    if (existing && existing.quantity > 1) {
                        newCart = state.cart.map((i) =>
                            i.productName === item.productName
                                ? { ...i, quantity: i.quantity - 1 }
                                : i
                        );
                    } else if (existing && existing.quantity === 1) {
                        newCart = state.cart.filter((i) => i.productName !== item.productName);
                    }
                    // Sincroniza después de actualizar el carrito
                    setTimeout(() => get().syncCartToSupabase(), 0);
                    return { cart: newCart };
                }),          
            showCartFunction: (show) => set(() => ({
                showCart: show,
            })),
            clearCart: () => set({ cart: [] }),
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
            partialize: (state) => ({ cart: state.cart }), // solo persiste el carrito
        }
    )
);