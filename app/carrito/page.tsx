"use client";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { CartCompleto } from "@/types/cart";
import { fetchProductos } from "@/utils/cart/fechProducts";
import Cesta from "@/components/cesta";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CarritoPage() {
    const cart = useCartStore((state) => state.cart);
    const supabase = createClient();
    const [productos, setProductos] = useState<CartCompleto[]>([]);
    const [seleccionados, setSeleccionados] = useState<string[]>([]); // IDs seleccionados
    const productosSeleccionados = productos.filter(p => seleccionados.includes(p.id));
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const clearCart = useCartStore((state) => state.clearCart);

    // Inicializa seleccionados cuando cambia productos
    useEffect(() => {
        setSeleccionados(productos.map(p => p.id)); // Por defecto, todos seleccionados
    }, [productos]);

    useEffect(() => {
        if (success) {
            //traemos del localStorage los id seleccionados
            const seleccionados = JSON.parse(localStorage.getItem("seleccionados") || "[]");
            console.log("Productos comprados:", seleccionados);
            // Si la compra fue exitosa, limpia el carrito los elementos comprados
            clearCart(seleccionados);
            setProductos([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success, canceled]);

    useEffect(() => {

        if (cart.length > 0) {
            fetchProductos(supabase, cart, setProductos, null);
        } else {
            setProductos([]);
        }

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
                    />
                </div>
                <div className="w-[300px] self-start text-center flex flex-col gap-1 justify-center items-center">
                    <h2 className="font-bold text-xl">Resumen de Compra</h2>
                    <p className="text-gray-600 font-bold text-center">
                        Productos: {productosSeleccionados.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}€
                    </p>
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
                    <Link href="/productos"
                    >
                        <button className="border-b-[1px] border-gray-300 text-violet-900 py-2 px-4 mt-4 rounded cursor-pointer hover:bg-violet-100">
                            Seguir comprando
                        </button>
                    </Link>
                </div>
            </div>

        </div>
    )
}




