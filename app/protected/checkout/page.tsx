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
import { Loader2} from 'lucide-react'
import { sweetAlert } from '@/components/ui/sweetAlert'

const CheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const seleccionados = searchParams.get("seleccionados")?.split(",") || [];
    const cart = useCartStore((state) => state.cart);
    const supabase = createClient();
    const [productos, setProductos] = useState<CartCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const [expirationTime, setExpirationTime] = useState<number>(480); // 8 minutos en segundos
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCancelBtn, setShowCancelBtn] = useState(false);
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
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: userId,
                    status: 'pending',
                    total_amount: totalProductos,
                    shipping_cost: totalEnvio,   
                    shipping_id: activeShipping.id             
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
                body: JSON.stringify({ cart: productos, shippingCost: totalEnvio }),
            });
            const data = await res.json();
            if (data.url) {
                // Guardar en localStorage para limpiar después Y para mostrar toast
                localStorage.setItem("seleccionados", JSON.stringify(seleccionados));
                localStorage.setItem("orderId", order.id);
                localStorage.setItem("showPaymentToast", "true");
                
                // Mostrar botón cancelar Y toast ANTES de redirigir
                setShowCancelBtn(true);
                setExpirationTime(480);
                
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

    /**
     * Cancelar orden pendiente
     */
    const handleCancelOrder = async () => {
        if (!window.confirm('¿Deseas cancelar este pago? Se perderá el carrito actual.')) return;
        
        try {
            const res = await fetch('/api/orders/retake', { method: 'DELETE' });
            const json = await res.json().catch(() => ({}));
            if (res.ok) {
                // limpiar localStorage y estado
                localStorage.removeItem('orderId');
                localStorage.removeItem('seleccionados');
                setShowCancelBtn(false);
                await sweetAlert('Cancelado', 'Pago cancelado. Volviendo al carrito...', 'success', 2000);
                router.push('/carrito');
            } else {
                const serverMsg = json?.error || 'Error al cancelar el pago.';
                console.error('Cancel failed:', serverMsg);
                await sweetAlert('Error', serverMsg, 'error', 4000);
            }
        } catch (error) {
            console.error('Error canceling order:', error);
            await sweetAlert('Error', 'Error al cancelar.', 'error', 3000);
        }
    };

    useEffect(() => {
        load(cart.filter(i => seleccionados.includes(i.id.toString())), setProductos, prevIdsRef, setLoading, supabase);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart, supabase]);

    /**
     * Timer para expiración de pago (8 minutos)
     * Si llega a 0, cancela automáticamente la orden
     */
    useEffect(() => {
        if (expirationTime <= 0) {
            handleCancelOrder();
            return;
        }

        const timer = setInterval(() => {
            setExpirationTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expirationTime]);

    /**
     * Formato MM:SS para el timer
     */
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Si el usuario vuelve del checkout de Stripe (canceló o expiró), mostrar toast
     */
    useEffect(() => {
        const orderId = localStorage.getItem("orderId");
        const showToast = localStorage.getItem("showPaymentToast");
        
        if (orderId && showToast === "true") {
            setShowCancelBtn(true);
            setExpirationTime(480); // Reiniciar timer a 8 minutos
            localStorage.removeItem("showPaymentToast");
        }
    }, []);

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
                <div className="w-[300px] self-start flex flex-col gap-1 justify-center items-center">
                    <h2 className="font-bold text-xl mb-5">Resumen de Compra</h2>
                    {
                        productos.length === 0 ? (
                            <div className='animate-pulse flex flex-col items-center w-full gap-2'>
                                <div className="h-6 bg-gray-200 rounded w-3/5" />
                                <div className="h-6 bg-gray-200 rounded w-3/5" />
                                <div className="h-6 bg-gray-200 rounded w-3/5" />
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 font-bold text-center">
                                    Productos: &nbsp;{totalProductos}€
                                </p>
                                <p className="text-gray-600 font-bold text-center">
                                    Envío: &nbsp;{(totalEnvio).toFixed(2)}€
                                </p>
                                <p className="text-gray-900 font-bold text-center">
                                    Importe Total: &nbsp;{(totalGeneral)}€
                                </p>
                            </>
                        )
                    }

                    <button
                        className={`bg-violet-500 max-w-[200px] hover:bg-violet-600 text-white py-2 px-4 mt-4 rounded cursor-pointer flex items-center justify-center gap-2 ${productos.length === 0 || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handlePay}
                        disabled={productos.length === 0 || isProcessing}
                    >
                        {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                        Proceder al pago
                    </button>

                    {/* Toast con timer de expiración */}
                    {showCancelBtn && (
                        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded flex items-center justify-between gap-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">⏱️ Tu pago expira en:</span>
                                <span className={`text-lg font-bold ${expirationTime < 60 ? 'text-red-600' : ''}`}>
                                    {formatTime(expirationTime)}
                                </span>
                            </div>
                        </div>
                    )}                    

                    <Link href="/carrito">
                        <button className="border-b-[1px] border-gray-300 text-violet-900 py-2 px-4 mt-4 rounded cursor-pointer hover:bg-violet-100">
                            Volver al carrito
                        </button>
                    </Link>
                </div>
            </div>

        </div>
    )
}

export default CheckoutPage