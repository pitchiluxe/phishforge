import { Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { KnowledgeService } from './knowledge.service';

@ApiTags('knowledge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/knowledge')
export class KnowledgeController {
  constructor(
    private readonly knowledge: KnowledgeService,
    private readonly supabase: SupabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge documents' })
  async listDocuments(@CurrentUser('organization_id') orgId: string) {
    const { data } = await this.supabase.db
      .from('knowledge_documents')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    return data ?? [];
  }

  @Post('upload')
  @Roles('owner', 'admin', 'manager')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and index a document' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('organization_id') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    const { data: doc } = await this.supabase.db
      .from('knowledge_documents')
      .insert({
        organization_id: orgId,
        uploaded_by: userId,
        name: file.originalname,
        file_type: file.mimetype,
        file_size: file.size,
        status: 'uploading',
      })
      .select()
      .single();

    const text = await this.extractText(file);
    this.knowledge.processDocument(doc.id, text, orgId);

    return { document: doc, message: 'Processing started' };
  }

  @Get('search')
  @ApiOperation({ summary: 'Semantic search across knowledge base' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number,
    @CurrentUser('organization_id') orgId: string,
  ) {
    return this.knowledge.search(query, orgId, limit ?? 5);
  }

  @Delete(':id')
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Delete a knowledge document' })
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser('organization_id') orgId: string,
  ) {
    await this.knowledge.deleteDocument(id, orgId);
    return { success: true };
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    const { mimetype, buffer } = file;

    if (mimetype === 'text/plain' || mimetype === 'text/html' || mimetype === 'text/csv') {
      return buffer.toString('utf-8');
    }

    if (mimetype === 'application/pdf') {
      const pdfParse = await import('pdf-parse');
      const parsed = await pdfParse.default(buffer);
      return parsed.text;
    }

    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    return buffer.toString('utf-8');
  }
}
