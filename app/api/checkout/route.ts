import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        // Inicializar Supabase con contexto de usuario (cookies) para pasar RLS
        const supabase = await createClient();

        // AHORA: Recibimos orderId. Ya no confiamos en el 'cart' del frontend.
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID requerido" }, { status: 400 });
        }

        // 1. Buscar los items de esa orden en la DB
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('producto_id, quantity')
            .eq('order_id', orderId);

        if (itemsError || !orderItems || orderItems.length === 0) {
            return NextResponse.json({ error: "Orden no encontrada o vacía (RLS check)" }, { status: 404 });
        }

        // 2. Extraer IDs de productos y consultar PRECIOS REALES en tabla 'productos'
        // (Ignoramos el precio que pueda estar en 'order_items' si fue puesto por el cliente)
        const productIds = orderItems.map((item: any) => item.producto_id);

        const { data: dbProducts, error: productsError } = await supabase
            .from('productos')
            .select('id, name, price, image_path, stock')
            .in('id', productIds);

        if (productsError || !dbProducts) {
            return NextResponse.json({ error: "Error validando precios de productos" }, { status: 500 });
        }

        // 3. Reconstruir line_items
        // 3. Reconstruir line_items
        const product_line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = dbProducts.reduce((acc: Stripe.Checkout.SessionCreateParams.LineItem[], dbProduct: any) => {
            // Buscar cantidad en el orderItems original
            const itemInOrder = orderItems.find((item: any) => item.producto_id === dbProduct.id);
            const quantity = itemInOrder ? itemInOrder.quantity : 0;

            if (quantity <= 0) return acc;

            // URL imagen
            const imageUrl = dbProduct.image_path
                ? supabase.storage.from('imagenes-jabones').getPublicUrl(dbProduct.image_path).data.publicUrl
                : "";

            acc.push({
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: dbProduct.name,
                        images: imageUrl ? [imageUrl] : [],
                        metadata: {
                            id: String(dbProduct.id), // Asegurar que sea string para Stripe metadata
                            stock: dbProduct.stock?.toString() ?? "",
                        }
                    },
                    unit_amount: Math.round(dbProduct.price * 100), // Precio de DB
                },
                quantity: quantity,
            });

            return acc;
        }, []);

        // 4. Costos de envio nos lo traemos de la tabla shipping_costs
        const { data: shippingCosts, error: shippingError } = await supabase
            .from('shipping_costs')
            .select('cost')
            .eq('description', 'Envio normal')
            .single();

        if (shippingError || !shippingCosts) {
            return NextResponse.json({ error: "Error validando costos de envio" }, { status: 500 });
        }

        const SERVER_SHIPPING_COST = shippingCosts.cost;
        const shipping_line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: "eur",
                product_data: {
                    name: "Envío",
                },
                unit_amount: Math.round(SERVER_SHIPPING_COST * 100),
            },
            quantity: 1,
        };

        const all_line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [...product_line_items, shipping_line_item];

        // 5. Crear Sesión Stripe
        // Añadimos metadata: { orderId } para vincular el pago a la orden.
        // En success_url pasamos order_id para que el frontend sepa cuál confirmar (aunque lo ideal seria webhook).
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: all_line_items, // @ts-ignore
            mode: "payment",
            metadata: {
                order_id: orderId
            },
            success_url: `${req.nextUrl.origin}/carrito?success=true&order_id=${orderId}`,
            cancel_url: `${req.nextUrl.origin}/carrito?canceled=true`,
        });

        return NextResponse.json({ url: session.url });

    } catch (err) {
        console.error("Error en checkout API:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}