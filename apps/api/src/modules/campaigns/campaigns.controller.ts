import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CampaignsService } from './campaigns.service';
import type { GenerateCampaignDto } from '@phishforge/shared';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List all campaigns for the organization' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser('organization_id') orgId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.campaigns.findAll(orgId, { status, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single campaign by ID' })
  async findOne(@Param('id') id: string, @CurrentUser('organization_id') orgId: string) {
    return this.campaigns.findOne(id, orgId);
  }

  @Post()
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create a new campaign' })
  async create(
    @Body() dto: GenerateCampaignDto,
    @CurrentUser('organization_id') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaigns.create(dto, orgId, userId);
  }

  @Post(':id/generate')
  @Throttle({ generate: { limit: 30, ttl: 60000 } })
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Generate AI phishing content for a campaign' })
  async generateContent(
    @Param('id') id: string,
    @Body() dto: GenerateCampaignDto,
    @CurrentUser('organization_id') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaigns.generateContent(id, dto, orgId, userId);
  }

  @Put(':id/status')
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update campaign status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('organization_id') orgId: string,
  ) {
    return this.campaigns.updateStatus(id, status, orgId);
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a campaign' })
  async delete(@Param('id') id: string, @CurrentUser('organization_id') orgId: string) {
    return this.campaigns.delete(id, orgId);
  }
}
