import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
