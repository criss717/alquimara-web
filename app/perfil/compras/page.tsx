import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
    title: 'Mis Compras | Alquimara',
    description: 'Historial de tus compras en Alquimara',
};

export default async function MisComprasPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Obtener órdenes con sus items
    const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                quantity,
                price_at_time,
                productos (
                    name,
                    slug,
                    image_path
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        return <div className="p-8 text-center text-red-500">Error al cargar tus compras.</div>;
    }

    // Procesar imágenes
    const orders = ordersData.map(order => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
            ...item,
            productImage: item.productos?.image_path
                ? supabase.storage.from('imagenes-jabones').getPublicUrl(item.productos.image_path).data.publicUrl
                : null
        }))
    }));

    // Función auxiliar para calcular entrega estimada (Fecha + 7 días)
    const getEstimatedDelivery = (dateString: string) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 7);
        return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-violet-900 border-b pb-4">Mis Compras</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-600 mb-4">Aún no has realizado ninguna compra.</p>
                    <Link href="/productos" className="bg-violet-600 text-white px-6 py-2 rounded-full hover:bg-violet-700 transition">
                        Explorar Productos
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                            {/* Cabecera del pedido */}
                            <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 uppercase font-semibold">Fecha de pedido</span>
                                    <span className="text-gray-900">{formatDate(order.created_at)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 uppercase font-semibold">Total</span>
                                    <span className="text-gray-900 font-bold">{order.total_amount}€ (+{order.shipping_cost}€ envio)</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 uppercase font-semibold">Pedido N.º</span>
                                    <span className="text-gray-900 font-mono text-xs">{order.id.slice(0, 8)}...</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize
                                        ${order.status === 'paid' || order.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {order.status === 'succeeded' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : order.status === 'cancelled' ? 'Cancelado' : order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Cuerpo del pedido */}
                            <div className="p-6">
                                {(order.status === 'paid' || order.status === 'succeeded') && (
                                    <div className="mb-6 p-4 bg-violet-50 rounded-md border border-violet-100">
                                        <h4 className="font-bold text-violet-800 mb-1">📅 Entrega Estimada</h4>
                                        <p className="text-violet-700">
                                            Llega el <span className="font-semibold">{getEstimatedDelivery(order.created_at)}</span>
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {order.order_items && order.order_items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-0 border-gray-50">
                                            <div className="relative w-16 h-16 flex-shrink-0 border rounded-md overflow-hidden bg-white">
                                                {item.productImage ? (
                                                    <Image
                                                        src={item.productImage}
                                                        alt={item.productos?.name || 'Producto'}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin foto</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <Link href={`/productos/${item.productos?.slug}`} className="font-semibold text-lg text-gray-800 hover:text-violet-600 hover:underline">
                                                    {item.productos?.name || 'Producto no disponible'}
                                                </Link>
                                                <div className="text-sm text-gray-500">Cantidad: {item.quantity}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold block">{item.price_at_time}€</span>
                                                <Link href={`/productos/${item.productos?.slug}`}>
                                                    <button className="text-xs text-violet-600 hover:text-violet-800 mt-1">
                                                        Volver a comprar
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer del pedido (acciones) */}
                            {order.status === 'pending' && (
                                <div className="bg-yellow-50 px-6 py-3 border-t border-yellow-100 flex justify-end">
                                    <Link href="/carrito">
                                        <button className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-sm text-sm font-bold transition">
                                            Retomar Pago Pendiente
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
