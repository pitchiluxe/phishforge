import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured');
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
  const { data: org } = await supabase.from('organizations').select('stripe_customer_id').eq('id', user?.organization_id).single();

  if (!org?.stripe_customer_id) return NextResponse.json({ error: 'No subscription found' }, { status: 404 });

  const { return_url } = await req.json();
  const portalSession = await stripe.billingPortal.sessions.create({ customer: org.stripe_customer_id, return_url });

  return NextResponse.json({ url: portalSession.url });
}
