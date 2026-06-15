import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { BillingPanel } from '@/components/billing/billing-panel';

export default async function BillingPage() {
  const supabase = await getSafeClient();
  const org = supabase
    ? (await supabase.from('organizations').select('plan,simulations_used_this_month,monthly_simulation_limit,stripe_subscription_id,plan_expires_at').single()).data
    : null;

  return (
    <div className="animate-in">
      <Header title="Billing" subtitle="Manage your subscription and usage" />
      <div style={{ padding: 24 }}>
        <BillingPanel
          plan={org?.plan ?? 'free'}
          used={org?.simulations_used_this_month ?? 0}
          limit={org?.monthly_simulation_limit ?? 100}
          expiresAt={org?.plan_expires_at}
          hasSubscription={!!org?.stripe_subscription_id}
        />
      </div>
    </div>
  );
}
