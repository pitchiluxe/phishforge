import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/supabase/supabase.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createCheckoutSession(orgId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const { data: org } = await this.supabase.db
      .from('organizations')
      .select('stripe_customer_id, name')
      .eq('id', orgId)
      .single();

    let customerId = org?.stripe_customer_id;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        name: org?.name,
        metadata: { organization_id: orgId },
      });
      customerId = customer.id;
      await this.supabase.db.from('organizations').update({ stripe_customer_id: customerId }).eq('id', orgId);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { organization_id: orgId },
    });

    return { url: session.url };
  }

  async createBillingPortalSession(orgId: string, returnUrl: string) {
    const { data: org } = await this.supabase.db
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', orgId)
      .single();

    if (!org?.stripe_customer_id) throw new Error('No Stripe customer found');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.getOrThrow('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error: any) {
      this.logger.error(`Stripe webhook signature verification failed: ${error.message}`);
      throw new Error('Invalid webhook signature');
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.organization_id;
        if (orgId) {
          const plan = this.mapPriceIdToPlan(sub.items.data[0]?.price?.id);
          await this.supabase.db.from('organizations').update({
            plan,
            stripe_subscription_id: sub.id,
            plan_expires_at: new Date((sub as any).current_period_end * 1000).toISOString(),
            monthly_simulation_limit: this.getPlanLimit(plan),
          }).eq('id', orgId);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.organization_id;
        if (orgId) {
          await this.supabase.db.from('organizations').update({
            plan: 'free',
            monthly_simulation_limit: 100,
          }).eq('id', orgId);
        }
        break;
      }
    }

    return { received: true };
  }

  async getCurrentSubscription(orgId: string) {
    const { data: org } = await this.supabase.db
      .from('organizations')
      .select('plan, plan_expires_at, monthly_simulation_limit, simulations_used_this_month, stripe_subscription_id')
      .eq('id', orgId)
      .single();

    return org;
  }

  private mapPriceIdToPlan(priceId?: string): 'free' | 'pro' | 'enterprise' {
    const proId = this.config.get('STRIPE_PRO_PRICE_ID');
    const entId = this.config.get('STRIPE_ENTERPRISE_PRICE_ID');
    if (priceId === proId) return 'pro';
    if (priceId === entId) return 'enterprise';
    return 'free';
  }

  private getPlanLimit(plan: string): number {
    const limits: Record<string, number> = { free: 100, pro: 5000, enterprise: 999999 };
    return limits[plan] ?? 100;
  }
}
