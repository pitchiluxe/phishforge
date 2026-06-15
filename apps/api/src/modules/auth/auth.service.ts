import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../common/supabase/supabase.service';
import type { LoginDto, RegisterDto, AuthResponse } from '@phishforge/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Create auth user in Supabase
    const { data: authData, error: authError } = await this.supabase.db.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new ConflictException('Email already registered');
      }
      throw new UnauthorizedException(authError.message);
    }

    const userId = authData.user.id;

    // Create organization
    const slug = this.generateSlug(dto.organization_name);
    const { data: org, error: orgError } = await this.supabase.db
      .from('organizations')
      .insert({ name: dto.organization_name, slug })
      .select()
      .single();

    if (orgError) {
      await this.supabase.db.auth.admin.deleteUser(userId);
      throw new ConflictException('Organization name already taken');
    }

    // Create user profile
    await this.supabase.db.from('users').insert({
      id: userId,
      organization_id: org.id,
      email: dto.email,
      full_name: dto.full_name,
      role: 'owner',
    });

    await this.supabase.logAudit({
      organization_id: org.id,
      user_id: userId,
      action: 'user.registered',
      resource_type: 'user',
      resource_id: userId,
    });

    const token = this.jwt.sign({ sub: userId, org_id: org.id, role: 'owner' });

    return {
      user: { id: userId, email: dto.email, full_name: dto.full_name, role: 'owner', organization_id: org.id },
      access_token: token,
    };
  }

  async login(dto: LoginDto, ipAddress?: string): Promise<AuthResponse> {
    const { data, error } = await this.supabase.db.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { data: user } = await this.supabase.db
      .from('users')
      .select('id, email, full_name, role, organization_id')
      .eq('id', data.user.id)
      .single();

    if (!user) throw new UnauthorizedException('User profile not found');

    await this.supabase.db.from('users').update({ last_sign_in_at: new Date().toISOString() }).eq('id', user.id);

    await this.supabase.logAudit({
      organization_id: user.organization_id,
      user_id: user.id,
      action: 'user.login',
      resource_type: 'user',
      ip_address: ipAddress,
    });

    const token = this.jwt.sign({ sub: user.id, org_id: user.organization_id, role: user.role });

    return {
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, organization_id: user.organization_id },
      access_token: token,
    };
  }

  async getProfile(userId: string) {
    const { data } = await this.supabase.db
      .from('users')
      .select('*, organizations(id, name, slug, plan, simulations_used_this_month, monthly_simulation_limit, ai_provider, openrouter_model)')
      .eq('id', userId)
      .single();
    return data;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.supabase.db.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 7);
  }
}
