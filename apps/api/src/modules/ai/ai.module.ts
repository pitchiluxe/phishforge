import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { OpenRouterService } from './openrouter.service';
import { OllamaService } from './ollama.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [AIService, OpenRouterService, OllamaService],
  controllers: [AIController],
  exports: [AIService, OpenRouterService, OllamaService],
})
export class AIModule {}
