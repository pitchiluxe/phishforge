import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PublicJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
    console.log('[PublicJwtAuthGuard] INSTANTIATED');
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    console.log(`[PublicJwtAuthGuard] ${request.method} ${request.path}, isPublic=${isPublic}`);

    if (isPublic) {
      console.log(`[PublicJwtAuthGuard] Route is public, returning true`);
      return true;
    }

    console.log(`[PublicJwtAuthGuard] Route is protected, activating JWT`);
    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user || true;
    }

    if (err || !user) {
      throw err || new (require('@nestjs/common').UnauthorizedException)('Invalid or expired token');
    }
    return user;
  }
}

