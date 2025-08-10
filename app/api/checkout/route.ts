import { CartCompleto } from "@/types/cart";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
    // Se recibe el carrito y el coste de envío desde el frontend
    const { cart, shippingCost } = await req.json();

    // Mapea los productos del carrito al formato de Stripe
    const product_line_items = cart.map((item: CartCompleto) => ({
        price_data: {
            currency: "eur",
            product_data: {
                name: item.name,
                images: [item.imageUrl],
                metadata: {
                    id: item.id,
                    slug: item.slug,
                    properties: JSON.stringify(item.properties),
                    stock: item.stock?.toString() ?? "",
                }
            },
            unit_amount: Math.round(item.price * 100), // en céntimos
        },
        quantity: item.quantity,
    }));

    // Crea un line_item adicional para el coste de envío
    const shipping_line_item = {
        price_data: {
            currency: "eur",
            product_data: {
                name: "Envío",
            },
            unit_amount: Math.round(shippingCost * 100), // Convierte el coste de envío a céntimos
        },
        quantity: 1,
    };

    // Combina los productos y el envío en una sola lista de line_items
    const all_line_items = [...product_line_items, shipping_line_item];

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: all_line_items, // Usa la lista combinada
        mode: "payment",
        success_url: `${req.nextUrl.origin}/carrito?success=true`,
        cancel_url: `${req.nextUrl.origin}/carrito?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
}