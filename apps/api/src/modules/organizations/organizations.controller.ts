import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseService } from '../../common/supabase/supabase.service';
import type { UpdateOrganizationDto } from '@phishforge/shared';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/organizations')
export class OrganizationsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current organization details' })
  async getMyOrg(@CurrentUser('organization_id') orgId: string) {
    const { data } = await this.supabase.db
      .from('organizations')
      .select('*, users(count)')
      .eq('id', orgId)
      .single();
    return data;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update organization settings' })
  async updateMyOrg(
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser('organization_id') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!orgId) throw new Error('No organization ID in token');
    try {
      const { data, error } = await this.supabase.db
        .from('organizations')
        .update(dto)
        .eq('id', orgId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update');

      await this.supabase.logAudit({
        organization_id: orgId,
        user_id: userId,
        action: 'organization.updated',
        resource_type: 'organization',
        resource_id: orgId,
        metadata: { changes: Object.keys(dto) },
      });

      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      throw new Error(`Organization update failed: ${msg}`);
    }
  }

  @Get('me/users')
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'List organization members' })
  async getUsers(@CurrentUser('organization_id') orgId: string) {
    const { data } = await this.supabase.db
      .from('users')
      .select('id, email, full_name, role, mfa_enabled, last_sign_in_at, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });
    return data ?? [];
  }

  @Patch('me/users/:userId/role')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update a user role' })
  async updateUserRole(
    @Param('userId') targetUserId: string,
    @Body('role') role: string,
    @CurrentUser('organization_id') orgId: string,
  ) {
    const { data } = await this.supabase.db
      .from('users')
      .update({ role })
      .eq('id', targetUserId)
      .eq('organization_id', orgId)
      .select()
      .single();
    return data;
  }
}
