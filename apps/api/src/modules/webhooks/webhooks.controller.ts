import { Controller, Get, Query, Redirect, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupabaseService } from '../../common/supabase/supabase.service';

@ApiTags('webhooks')
@Controller('t')
export class WebhooksController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('open')
  @ApiOperation({ summary: 'Track email open (1x1 pixel beacon)' })
  async trackOpen(@Query('token') token: string) {
    await this.recordEvent(token, 'opened');
    return Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );
  }

  @Get('click')
  @Redirect()
  @ApiOperation({ summary: 'Track link click and redirect to landing page' })
  async trackClick(@Query('token') token: string, @Query('r') redirectTo?: string) {
    await this.recordEvent(token, 'clicked');
    return { url: redirectTo ?? `${process.env.NEXT_PUBLIC_APP_URL}/training` };
  }

  @Get('submit')
  @HttpCode(200)
  @ApiOperation({ summary: 'Track credential submission' })
  async trackSubmit(@Query('token') token: string) {
    await this.recordEvent(token, 'submitted');
    return { success: true };
  }

  @Get('report')
  @HttpCode(200)
  @ApiOperation({ summary: 'Track phishing report by user' })
  async trackReport(@Query('token') token: string) {
    await this.recordEvent(token, 'reported');
    return { message: 'Thank you for reporting this simulation!' };
  }

  private async recordEvent(token: string, eventType: string) {
    if (!token) return;

    const { data: target } = await this.supabase.db
      .from('campaign_targets')
      .select('id, campaign_id, organization_id')
      .eq('tracking_token', token)
      .single();

    if (!target) return;

    await this.supabase.db.from('tracking_events').insert({
      target_id: target.id,
      campaign_id: target.campaign_id,
      organization_id: target.organization_id,
      event_type: eventType,
    });

    const statsField = `stats->>${eventType}`;
    await this.supabase.db.rpc('increment_campaign_stat', {
      p_campaign_id: target.campaign_id,
      p_stat: eventType,
    });
  }
}
