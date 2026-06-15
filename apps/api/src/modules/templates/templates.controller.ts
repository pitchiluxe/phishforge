import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseService } from '../../common/supabase/supabase.service';

@ApiTags('templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/templates')
export class TemplatesController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  @ApiOperation({ summary: 'List templates (own + public library)' })
  async findAll(
    @CurrentUser('organization_id') orgId: string,
    @Query('industry') industry?: string,
    @Query('public_only') publicOnly?: boolean,
  ) {
    let query = this.supabase.db
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (publicOnly) {
      query = query.eq('is_public', true);
    } else {
      query = query.or(`organization_id.eq.${orgId},is_public.eq.true`);
    }

    if (industry) query = query.eq('industry', industry);

    const { data } = await query;
    return data ?? [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single template' })
  async findOne(@Param('id') id: string) {
    const { data } = await this.supabase.db.from('templates').select('*').eq('id', id).single();
    return data;
  }
}
