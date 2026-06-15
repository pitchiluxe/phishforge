import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
  const { data: org } = await supabase.from('organizations').select('stripe_customer_id, name').eq('id', user?.organization_id).single();

  const { price_id, success_url, cancel_url } = await req.json();

  let customerId = org?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: org?.name,
      metadata: { organization_id: user?.organization_id },
    });
    customerId = customer.id;
    await supabase.from('organizations').update({ stripe_customer_id: customerId }).eq('id', user?.organization_id);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: price_id, quantity: 1 }],
    mode: 'subscription',
    success_url,
    cancel_url,
    metadata: { organization_id: user?.organization_id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
