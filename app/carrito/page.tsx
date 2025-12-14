"use client"
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/utils/supabase/client";
import { CartCompleto } from "@/types/cart";
import Cesta from "@/components/cesta";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { load } from "@/utils/utils";
import { useEffect, useState, useRef } from 'react';
import { X } from "lucide-react";
import { sweetAlert } from "@/components/ui/sweetAlert";
import ProductCarousel from '@/components/ProductCarousel';
import { fetchProductsForCarousel } from '@/utils/cart/fetchProducts';
import CardProductProps from "@/types/cardProductProps";

// La función auxiliar ahora espera el tipo correcto
async function fetchMoreProducts(
  supabase: ReturnType<typeof createClient>,
  setMoreProducts: React.Dispatch<React.SetStateAction<CardProductProps[]>>
) {
  const moreProducts = await fetchProductsForCarousel(supabase);
  console.log('Fetched more products for carousel:', moreProducts);
  setMoreProducts(moreProducts);
}

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
    const [hasPending, setHasPending] = useState(false);
    const [expiresIn, setExpiresIn] = useState<number | null>(null);
    // 2. CAMBIAR TIPO DEL ESTADO
    const [moreProducts, setMoreProducts] = useState<CardProductProps[]>([]);

    useEffect(() => {
        fetchMoreProducts(supabase, setMoreProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '--:--';
        const s = Math.max(0, seconds);
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    const handleCancelOrder = async () => {
        try {
            const confirmResult = await sweetAlert(
                '¿Estás seguro?',
                '¿Quieres cancelar el pedido pendiente?',
                'question',
                0,
                true
            );
            if (!confirmResult.isConfirmed) return;
            const res = await fetch('/api/orders/retake', { method: 'DELETE' });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.success) {
                await sweetAlert('Pedido cancelado', 'El pedido pendiente ha sido cancelado correctamente.', 'success', 3000);
                setHasPending(false);
                setExpiresIn(null);
            } else {
                const serverMsg = json?.error || 'No se pudo cancelar el pedido';
                console.error('No se pudo cancelar el pedido', json);
                await sweetAlert('Error', serverMsg, 'error', 4000);
            }
        } catch (e) {
            console.error('cancel order error', e);
        }
    }
    
    useEffect(() => {
        if (productos.length > 0 && seleccionados.length === 0) {
            setSeleccionados(productos.map(p => p.id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productos]);

    useEffect(() => {
        if (success) {
            const seleccionados = JSON.parse(localStorage.getItem("seleccionados") || "[]");
            const orderId = localStorage.getItem("orderId");
            clearCart(seleccionados);
            setProductos([]);

            const updateOrder = async (orderId: string | null) => {
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({ status: 'paid' })
                    .eq('id', orderId);

                if (updateError) {
                    console.error('Error updating order status:', updateError);
                }
            }
            updateOrder(orderId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success, canceled]);

    useEffect(() => {
        load(cart, setProductos, prevIdsRef, setLoading, supabase);
    }, [cart, supabase]);

    useEffect(() => {
        const checkPending = async () => {
            try {
                const res = await fetch('/api/orders/retake?check=true');
                const json = await res.json();
                const pending = Boolean(json.pending);
                setHasPending(pending);
                if (pending && json.expires_at) {
                    const expiresAt = new Date(json.expires_at).getTime();
                    const delta = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
                    setExpiresIn(delta);
                } else {
                    setExpiresIn(null);
                }
            } catch (e) {
                console.error('check pending error', e);
            }
        };
        checkPending();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkPending();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        if (!hasPending || expiresIn === null || expiresIn <= 0) {
            return;
        }
        const timer = setInterval(() => {
            setExpiresIn((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    setHasPending(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [hasPending, expiresIn]);

    return (
        <div className="flex flex-col w-full min-h-screen">
            {success && (
                <div className="bg-green-100 border text-center border-green-400 text-green-700 px-4 py-2 rounded relative" role="alert">
                    <strong className="font-bold">¡Felicidades!</strong>
                    <span className="block sm:inline"> Tu compra se ha realizado con éxito.</span>
                </div>                
            )}
            <div className="flex justify-center p-4">
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
                <div className={`w-[300px] self-start text-center flex flex-col gap-1 justify-center items-center`}>
                    {hasPending && (
                        <div className="w-full flex justify-center gap-2 items-center">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/orders/retake', { method: 'POST' });
                                        const json = await res.json();
                                        if (json.url) {
                                            window.location.href = json.url;
                                        } else {
                                            console.error('No url returned', json);
                                        }
                                    } catch (e) {
                                        console.error('retake error', e);
                                    }
                                }}
                                className="w-[130px] cursor-pointer bg-yellow-500 text-black py-2 px-3 rounded hover:bg-yellow-600 transition relative"
                            >
                                Retomar pago
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="w-8 h-8 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all relative"
                                title="Cancelar pago"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {hasPending && expiresIn !== null && (
                        <div className="text-sm text-gray-700 mt-2">Expira en: {formatTime(expiresIn)}</div>
                    )}
                    {productos.length > 0 && <>
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
                    </>}
                </div>
            </div>
            <section className="mt-12 p-4">
                <h3 className="text-2xl font-semibold mb-4">También te puede interesar</h3>
                <div className="w-full">
                    <ProductCarousel products={moreProducts} />
                </div>
            </section>
            
        </div>
    )
}