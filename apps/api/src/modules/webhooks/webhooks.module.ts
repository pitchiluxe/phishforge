import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
