"use client"
import Cesta from '@/components/cesta'
import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { createClient } from "@/utils/supabase/client";
import { CartCompleto } from "@/types/cart";
import Link from 'next/link'
import { load } from '@/utils/utils'
import ResumenDireccion from '@/components/ResumenDireccion'

const CheckoutPage = () => {
    const searchParams = useSearchParams();
    const seleccionados = searchParams.get("seleccionados")?.split(",") || [];
    const cart = useCartStore((state) => state.cart);
    const supabase = createClient();
    const [productos, setProductos] = useState<CartCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const prevIdsRef = useRef<string>("");
    const userId = useCartStore((state) => state.userId);

    const totalProductos = productos?.length > 0 ? productos.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2) : "0.00";
    const totalEnvio = 5.99;
    const totalGeneral = (parseFloat(totalProductos) + totalEnvio).toFixed(2);

    const handlePay = async () => {
        //revisar cual shipping detail esta activo
        const { data: activeShipping, error: shippingError } = await supabase
            .from('shipping_details')
            .select('*')
            .eq('user_id', userId)
            .eq('active', true)
            .single();
        if (shippingError || !activeShipping) {
            alert('Por favor, selecciona una dirección de envío antes de proceder con el pago.');
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
            window.location.href = data.url; // Redirige a Stripe Checkout

            //guardamos en el localstorage los id seleccionados y el id del pedido para posteriormente borrarlos de el carrito del usuario
            localStorage.setItem("seleccionados", JSON.stringify(seleccionados));
            localStorage.setItem("orderId", order.id);
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
                        className={`bg-violet-500 max-w-[200px] hover:bg-violet-600 text-white py-2 px-4 mt-4 rounded cursor-pointer ${productos.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handlePay}
                        disabled={productos.length === 0}
                    >
                        Proceder con el pago
                    </button>
                    <Link href="/carrito">
                        <button className="border-b-[1px] border-gray-300 text-violet-900 py-2 px-4 mt-4 rounded cursor-pointer hover:bg-violet-100">
                            Modificar pedido
                        </button>
                    </Link>
                </div>
            </div>

        </div>
    )
}

export default CheckoutPage