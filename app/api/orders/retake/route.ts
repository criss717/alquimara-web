import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/**
 * Tipos para órdenes e items
 */
interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_cost?: number;
  shipping_id?: string;
  expires_at?: string | null;
}
interface Product {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image_path?: string;
}

/**
 * Busca la última orden con status 'pending' del usuario
 * @param sup Cliente de Supabase
 * @returns Orden pendiente o null
 */
/**
 * Busca la última orden con status 'pending' del usuario dado
 * @param sup Cliente de Supabase
 * @param userId Id del usuario
 * @returns Orden pendiente o null
 */
async function findLatestPendingOrder(sup: SupabaseClient, userId: string): Promise<Order | null> {
  const { data: orders, error } = await sup
    .from('orders')
    .select('*')
    .eq('status', 'pending')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return (orders && orders.length > 0) ? (orders[0] as Order) : null;
}

/**
 * GET: Comprobar si existe una orden pendiente para el usuario
 * @returns { pending: boolean, orderId?: string }
 */
export async function GET(): Promise<NextResponse> {
  try {
    const sup = await createClient();
    const { data: { user } } = await sup.auth.getUser();
    const userId = user?.id;
    if (!userId) return NextResponse.json({ pending: false });

    const order = await findLatestPendingOrder(sup, userId);
    if (!order) return NextResponse.json({ pending: false });

    // devolver expires_at si existe para que el cliente pueda mostrar countdown
    return NextResponse.json({ pending: true, orderId: order.id, expires_at: order.expires_at || null });
  } catch (e) {
    return NextResponse.json({ pending: false, error: String(e) }, { status: 500 });
  }
}

/**
 * POST: Retomar compra pendiente creando sesión Stripe con items de la orden
 * @returns { url: string } | { error: string }
 */
export async function POST() {
  try {
    const sup = await createClient();

    const { data: { user } } = await sup.auth.getUser();
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await findLatestPendingOrder(sup, userId);
    if (!order) return NextResponse.json({ error: 'No pending order' }, { status: 404 });

    // Leer items de la orden
    let items: Array<{
      product_id: string | number;
      quantity: number;
      price: number;
    }> = [];

    const { data: orderItems, error: oiErr } = await sup
      .from('order_items')
      .select('producto_id, quantity, price_at_time')
      .eq('order_id', order.id);

    if (oiErr) {
      console.error('Error reading order_items', oiErr);
    } else if (orderItems && orderItems.length > 0) {
      items = orderItems.map((oi) => ({
        product_id: oi.producto_id,
        quantity: oi.quantity,
        price: oi.price_at_time
      }));
    }

    if (!items || items.length === 0) {
      console.error('Order has no items in order_items', { orderId: order.id });
      return NextResponse.json({ error: 'Order has no items' }, { status: 400 });
    }

    // Obtener detalles de productos incluyendo image_path
    const productIds = items.map((it) => String(it.product_id)).filter(Boolean);
    const productsMap: Record<string, Product> = {};

    if (productIds.length > 0) {
      const { data: products, error: prodErr } = await sup
        .from('productos')
        .select('id, name, description, price, image_path')
        .in('id', productIds);

      if (prodErr) {
        console.error('Error fetching productos', prodErr);
      }

      if (products) {
        products.forEach((p) => {
          productsMap[String(p.id)] = p;
        });
      }
    }

    // Construir line_items con imágenes para Stripe
    const line_items = items.map((it) => {
      const id = String(it.product_id);
      const quantity = Number(it.quantity || 1);
      const prod = productsMap[id];
      const images: string[] = [];

      if (prod?.image_path) {
        const { data } = sup.storage
          .from('imagenes-jabones')
          .getPublicUrl(prod.image_path);
        if (data?.publicUrl) {
          images.push(data.publicUrl);
        }
      }

      const unit_amount = Math.round((Number(it.price) || Number(prod?.price) || 0) * 100);

      return {
        price_data: {
          currency: 'eur',
          unit_amount,
          product_data: {
            name: prod?.name || 'Producto',
            description: prod?.description || '',
            ...(images.length > 0 && { images }),
            metadata: { product_id: id }
          }
        },
        quantity: Math.max(1, quantity)
      };
    }).filter(Boolean);

    const host = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key missing when attempting to create session');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${host}/carrito?success=true&orderId=${order.id}`,
      cancel_url: `${host}/carrito?canceled=true&orderId=${order.id}`,
      metadata: { orderId: String(order.id) }
    });

    // Actualizar orden: registrar intento de retoma
    await sup
      .from('orders')
      .update({ last_retry_at: new Date().toISOString() })
      .eq('id', order.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('retake error', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE: Cancelar orden pendiente
 * @returns { success: boolean } | { error: string }
 */
export async function DELETE() {
  try {
    const sup = await createClient();

    const { data: { user } } = await sup.auth.getUser();
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Buscar última orden pendiente
    const order = await findLatestPendingOrder(sup, userId);
    if (!order) return NextResponse.json({ error: 'No pending order' }, { status: 404 });

    // Marcar como cancelada
    const { error } = await sup
      .from('orders')
      .update({ status: 'canceled' })
      .eq('id', order.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('cancel order error', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
