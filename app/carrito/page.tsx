"use client"
import { useCartStore } from "@/store/cartStore";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CartCompleto } from "@/types/cart";
import Cesta from "@/components/cesta";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { load } from "@/utils/utils";

export default function CarritoPage() {
    const cart = useCartStore((state) => state.cart);
    const supabase = createClient();
    const [productos, setProductos] = useState<CartCompleto[]>([]);
    const [seleccionados, setSeleccionados] = useState<string[]>([]);
    const productosSeleccionados = productos.filter(p => seleccionados.includes(p.id));
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const clearCart = useCartStore((state) => state.clearCart);    

    const [loading, setLoading] = useState(true);
    const prevIdsRef = useRef<string>("");

    useEffect(() => {
        setSeleccionados(productos.map(p => p.id));
    }, [productos]);

    useEffect(() => {
        if (success) {
            const seleccionados = JSON.parse(localStorage.getItem("seleccionados") || "[]");
            clearCart(seleccionados);
            setProductos([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success, canceled]);

    useEffect(() => {
        load(cart, setProductos, prevIdsRef, setLoading, supabase);
    }, [cart, supabase]);

    return (
        <div className="flex flex-col w-full">
            {success && (
                <div className="bg-green-100 border text-center border-green-400 text-green-700 px-4 py-2 rounded relative" role="alert">
                    <strong className="font-bold">¡Felicidades!</strong>
                    <span className="block sm:inline"> Tu compra se ha realizado con éxito.</span>
                </div>
            )}
            <div className="flex justify-center min-h-screen bg-gray-100 p-4">
                <div className="flex-col flex-1 flex gap-2">
                    <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
                    <Cesta
                        productos={productos}
                        seleccionados={seleccionados}
                        setSeleccionados={setSeleccionados}
                        loading={loading}
                        skeletonCount={cart.length}
                    />
                </div>
                <div className="w-[300px] self-start text-center flex flex-col gap-1 justify-center items-center">
                    <h2 className="font-bold text-xl">Resumen de Compra</h2>
                    {
                        productos.length === 0 ? (
                            <div className="animate-pulse h-6 bg-gray-200 rounded w-2/5" />
                        ) : (
                            <p className="text-gray-600 font-bold text-center">
                                Productos: {productosSeleccionados.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}€
                            </p>
                        )
                    }                
                    <Link href={{
                        pathname: "/protected/checkout",
                        query: { seleccionados: seleccionados.join(",") }
                    }}>
                        <button
                            className={`bg-violet-500 text-white py-2 px-4 mt-4 hover:bg-violet-600 rounded cursor-pointer ${productos.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={productos.length === 0}
                        >
                            Tramitar pedido
                        </button>
                    </Link>
                    <Link href="/productos">
                        <button className="border-b-[1px] border-gray-300 text-violet-900 py-2 px-4 mt-4 rounded cursor-pointer hover:bg-violet-100">
                            Seguir comprando
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}