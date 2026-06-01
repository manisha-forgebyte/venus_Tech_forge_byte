import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      // Extract refresh token from request body
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),

      // Ignore expiration = false
      ignoreExpiration: false,

      // JWT secret key
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
    });
  }

  // Validate refresh token payload
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}