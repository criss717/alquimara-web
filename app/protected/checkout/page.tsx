"use client"
import Cesta from '@/components/cesta'
import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { createClient } from "@/utils/supabase/client";
import { CartCompleto } from "@/types/cart";
import Link from 'next/link'
import { load } from '@/utils/utils'
import ResumenDireccion from '@/components/ResumenDireccion'
import { Loader2 } from 'lucide-react'
import { sweetAlert } from '@/components/ui/sweetAlert'

const CheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const seleccionados = searchParams.get("seleccionados")?.split(",") || [];
    const cart = useCartStore((state) => state.cart);
    const supabase = createClient();
    const [productos, setProductos] = useState<CartCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const prevIdsRef = useRef<string>("");
    const userId = useCartStore((state) => state.userId);

    const totalProductos = productos?.length > 0 ? productos.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2) : "0.00";
    const totalEnvio = 5.99;
    const totalGeneral = (parseFloat(totalProductos) + totalEnvio).toFixed(2);

    const handlePay = async () => {
        setIsProcessing(true);
        try {
            // Revisar si existe una orden pendiente previa
            const checkRes = await fetch('/api/orders/retake?check=true');
            const checkData = await checkRes.json();
            if (checkData.pending) {
                await sweetAlert('Compra pendiente', 'Ya tienes una compra pendiente. Por favor, completa o cancela el pago anterior.', 'warning', 3000);
                router.push('/carrito');
                setIsProcessing(false);
                return;
            }

            //revisar cual shipping detail esta activo
            const { data: activeShipping, error: shippingError } = await supabase
                .from('shipping_details')
                .select('*')
                .eq('user_id', userId)
                .eq('active', true)
                .single();
            if (shippingError || !activeShipping) {
                await sweetAlert('Dirección requerida', 'Por favor, selecciona una dirección de envío antes de proceder con el pago.', 'warning', 3000);
                setIsProcessing(false);
                return;
            }
            // 1. Crear el pedido
            const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 horas
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: userId,
                    status: 'pending',
                    total_amount: totalProductos,
                    shipping_cost: totalEnvio,
                    shipping_id: activeShipping.id,
                    expires_at: expiresAt
                }])
                .select()
                .single();

            if (orderError || !order) {
                throw new Error('Error al crear el pedido');
            }
            //2. Guardar items del pedido
            const orderItems = productos.map(item => ({
                order_id: order.id,
                producto_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                throw new Error('Error al guardar los items del pedido');
            }

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }), // SOLO enviamos el ID de la orden
            });

            let data;
            try {
                const text = await res.text();
                // Intentar parsear si parece JSON
                try {
                    data = JSON.parse(text);
                } catch {
                    console.error("Respuesta no válida del servidor (HTML espera JSON):", text);
                    throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
                }

                if (!res.ok) {
                    throw new Error(data?.error || "Error en el servidor de checkout");
                }
            } catch (err) {
                console.error("Error interpretando respuesta:", err);
                throw err;
            }

            if (data.url) {
                // Guardar en localStorage para limpiar después
                localStorage.setItem("seleccionados", JSON.stringify(seleccionados));
                localStorage.setItem("orderId", order.id);

                // Esperar un tick para que React renderice antes de navegar
                await new Promise(resolve => setTimeout(resolve, 500));
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error en pago:', error);
            await sweetAlert('Error', 'Error al procesar el pago. Intenta de nuevo.', 'error', 3000);
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        load(cart.filter(i => seleccionados.includes(i.id.toString())), setProductos, prevIdsRef, setLoading, supabase);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart, supabase]);

    return (
        <div className="flex flex-col w-full">
            <div className="flex justify-center min-h-screen bg-gray-100 p-4">
                <div className="flex-col flex-1 flex gap-4">
                    <ResumenDireccion />
                    <h1 className="text-2xl font-bold mb-4">Productos Seleccionados</h1>
                    <Cesta
                        productos={productos}
                        seleccionados={[]}
                        setSeleccionados={null}
                        loading={loading}
                        skeletonCount={seleccionados.length}
                    />
                </div>
                {/* Resumen de compra  hacerlo fijo*/}
                <div className="w-[300px] mx-2 self-start sticky top-28 flex flex-col gap-1 justify-center items-center">
                    <div className="border-2 border-violet-100 p-4 rounded-lg shadow-md w-full animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="font-bold text-xl text-violet-900 mb-4 text-center">Resumen de Compra</h2>
                        {
                            productos.length === 0 ? (
                                <div className='animate-pulse flex flex-col items-center w-full gap-2'>
                                    <div className="h-6 bg-gray-200 rounded w-3/5" />
                                    <div className="h-6 bg-gray-200 rounded w-3/5" />
                                    <div className="h-6 bg-gray-200 rounded w-3/5" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1 mb-4">
                                    <p className="text-gray-600 font-bold flex justify-between">
                                        <span>Productos:</span>
                                        <span>{totalProductos}€</span>
                                    </p>
                                    <p className="text-gray-600 font-bold flex justify-between">
                                        <span>Envío:</span>
                                        <span>{(totalEnvio).toFixed(2)}€</span>
                                    </p>
                                    <div className="h-px bg-violet-200 my-2"></div>
                                    <p className="text-gray-900 font-bold flex justify-between text-lg">
                                        <span>Importe Total:</span>
                                        <span>{(totalGeneral)}€</span>
                                    </p>
                                </div>
                            )
                        }

                        <button
                            className={`w-full bg-violet-600 text-white font-bold py-2 px-4 hover:bg-violet-700 rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer ${productos.length === 0 || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={handlePay}
                            disabled={productos.length === 0 || isProcessing}
                        >
                            {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                            Proceder al pago
                        </button>

                        <div className="mt-2 text-center">
                            <Link href="/carrito">
                                <button className="text-sm text-violet-600 hover:text-violet-800 underline decoration-violet-300 underline-offset-4 py-1 cursor-pointer">
                                    Volver al carrito
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CheckoutPage