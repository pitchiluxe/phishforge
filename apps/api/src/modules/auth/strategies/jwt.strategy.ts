import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  org_id: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Custom JWT extractor that handles demo mode
function extractJwt(req: Request): string | null {
  const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (fromHeader) return fromHeader;
  
  // Check for demo token
  if (req.headers.authorization?.startsWith('Bearer demo-token')) {
    return req.headers.authorization.replace('Bearer ', '');
  }
  
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private isDemo: boolean;

  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractJwt,
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'demo-secret-key'),
      passReqToCallback: true,
    });
    
    // Check if running in demo mode
    const supabaseUrl = config.get('SUPABASE_URL', '');
    this.isDemo = !supabaseUrl || supabaseUrl.includes('localhost') || supabaseUrl.includes('placeholder');
  }

  async validate(req: Request, payload: string | JwtPayload) {
    // Handle demo tokens
    if (typeof payload === 'string' && payload.startsWith('demo-token')) {
      return {
        id: 'demo-user',
        sub: 'demo-user',
        organization_id: 'demo-org',
        role: 'owner',
      };
    }

    // Handle real JWT tokens
    if (typeof payload !== 'object') {
      throw new UnauthorizedException('Invalid token');
    }

    if (!payload.sub || !payload.org_id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub,
      sub: payload.sub,
      organization_id: payload.org_id,
      role: payload.role,
    };
  }
}

