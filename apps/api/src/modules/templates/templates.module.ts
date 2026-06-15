import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [TemplatesController],
})
export class TemplatesModule {}
