import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  async getDashboard(@CurrentUser('organization_id') orgId: string) {
    return this.analytics.getDashboardStats(orgId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary for a time period' })
  async getSummary(
    @CurrentUser('organization_id') orgId: string,
    @Query('period') period: '7d' | '30d' | '90d' | '365d' = '30d',
  ) {
    return this.analytics.getSummary(orgId, period);
  }

  @Get('threat-intelligence')
  @ApiOperation({ summary: 'Get threat intelligence feed' })
  async getThreatIntel(
    @Query('industry') industry?: string,
    @Query('limit') limit?: number,
  ) {
    return this.analytics.getThreatIntelligence(industry, limit);
  }
}
