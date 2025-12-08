import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

async function findLatestPendingOrder(sup: any) {
  const { data: orders, error } = await sup
    .from('orders')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return (orders && orders.length > 0) ? orders[0] : null;
}

export async function GET(request: Request) {
  // check mode: ?check=true
  try {
    const sup = await createClient();
    const url = new URL(request.url);
    const check = url.searchParams.get('check');

    const { data: { user } } = await sup.auth.getUser();
    const userId = user?.id;
    if (!userId) return NextResponse.json({ pending: false });

    const order = await findLatestPendingOrder(sup);
    if (!order) return NextResponse.json({ pending: false });
    return NextResponse.json({ pending: true, orderId: order.id });
  } catch (e) {
    return NextResponse.json({ pending: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sup = await createClient();
    const { data: { user } } = await sup.auth.getUser();
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await findLatestPendingOrder(sup);
    if (!order) return NextResponse.json({ error: 'No pending order' }, { status: 404 });

    // parse items
    let items: any[] = [];
    if (Array.isArray(order.items)) items = order.items;
    else if (typeof order.items === 'string') {
      try { items = JSON.parse(order.items); } catch { items = []; }
    }

    // collect product ids
    const productIds = items.map(it => String(it.product_id || it.id || it.productId)).filter(Boolean);
    let productsMap: Record<string, any> = {};
    if (productIds.length > 0) {
      const { data: products } = await sup
        .from('productos')
        .select('id, name, description, price')
        .in('id', productIds);
      (products || []).forEach((p: any) => { productsMap[String(p.id)] = p; });
    }

    const line_items = items.map((it: any) => {
      const id = String(it.product_id || it.id || it.productId);
      const quantity = Number(it.quantity || it.qty || 1);
      const prod = productsMap[id] || {};
      const unit_amount = Math.round((Number(prod.price) || Number(it.price) || 0) * 100);
      return {
        price_data: {
          currency: 'eur',
          product_data: { name: prod.name || it.name || 'Producto' },
          unit_amount,
        },
        quantity: Math.max(1, quantity),
      };
    }).filter(Boolean);

    const host = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${host}/carrito?success=true&orderId=${order.id}`,
      cancel_url: `${host}/carrito?canceled=true&orderId=${order.id}`,
      metadata: { orderId: String(order.id) },
    });

    // Optionally update order: set last_retry_at
    await sup.from('orders').update({ last_retry_at: new Date().toISOString() }).eq('id', order.id);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('retake error', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
