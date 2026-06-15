import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  get db(): SupabaseClient {
    return this.client;
  }

  async logAudit(params: {
    organization_id?: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    ip_address?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.client.from('audit_logs').insert(params);
  }
}
