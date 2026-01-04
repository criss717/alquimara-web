import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Usamos el cliente de Supabase con el Service Role Key porque
// los webhooks no tienen cookies de sesión de usuario.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Endpoint de Webhook para Stripe.
 * Escucha eventos de pago exitoso para marcar órdenes como pagadas y reducir stock.
 */
export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            throw new Error("Missing stripe-signature or endpoint secret");
        }
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
        console.error(`❌ Error de firma de Webhook: ${err.message}`);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    // Manejar el evento checkout.session.completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (!orderId) {
            console.error("❌ No se encontró order_id en la metadata de la sesión");
            return NextResponse.json({ error: "No order_id found" }, { status: 400 });
        }

        console.log(`🔔 Procesando pago exitoso para Orden: ${orderId}`);

        try {
            // 1. Marcar la orden como pagada
            console.log(`⏳ Intentando marcar orden ${orderId} como pagada...`);
            const { data: updateData, error: updateError } = await supabaseAdmin
                .from("orders")
                .update({ status: "paid" })
                .eq("id", orderId)
                .select();

            if (updateError) {
                console.error("❌ Error actualizando orden:", updateError);
                throw updateError;
            }

            if (!updateData || updateData.length === 0) {
                console.warn(`⚠️ No se encontró la orden ${orderId} para actualizar o ya estaba procesada.`);
            } else {
                console.log(`✅ Orden ${orderId} marcada como pagada correctamente.`);
            }

            // 2. Ejecutar la función RPC para reducir el stock
            console.log(`⏳ Intentando reducir stock para la orden ${orderId}...`);
            const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc("reduce_stock", {
                p_order_id: orderId,
            });

            if (rpcError) {
                console.error("❌ Error ejecutando RPC reduce_stock:", rpcError);
            } else {
                console.log(`✅ RPC reduce_stock ejecutado para la orden ${orderId}.`);
            }

            console.log(`🚀 Proceso de webhook finalizado para la orden ${orderId}.`);
        } catch (dbError: any) {
            console.error(`❌ Error en base de datos durante webhook: ${dbError.message}`);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

// Stripe necesita el cuerpo en crudo, Next.js por defecto intentaría parsearlo.
export const config = {
    api: {
        bodyParser: false,
    },
};
