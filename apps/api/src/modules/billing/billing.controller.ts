import { Controller, Get, Post, Body, Headers, RawBodyRequest, Req, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import type { Request } from 'express';

@ApiTags('billing')
@Controller('v1/billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session for upgrading plan' })
  async createCheckout(
    @Body('price_id') priceId: string,
    @Body('success_url') successUrl: string,
    @Body('cancel_url') cancelUrl: string,
    @CurrentUser('organization_id') orgId: string,
  ) {
    return this.billing.createCheckoutSession(orgId, priceId, successUrl, cancelUrl);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe billing portal session' })
  async createPortalSession(
    @Body('return_url') returnUrl: string,
    @CurrentUser('organization_id') orgId: string,
  ) {
    return this.billing.createBillingPortalSession(orgId, returnUrl);
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription details' })
  async getSubscription(@CurrentUser('organization_id') orgId: string) {
    return this.billing.getCurrentSubscription(orgId);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook handler (no auth required)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billing.handleWebhook(req.rawBody!, signature);
  }
}
