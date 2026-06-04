import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { getJwtRefreshSecret } from '../../../config/jwt.config';

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
      secretOrKey: getJwtRefreshSecret(),
    });
  }

  // Validate refresh token payload
  async validate(payload: any) {
    return {
      id: payload.sub,
      uid: payload.uid,
      email: payload.email,
      role: payload.role,
      aid: payload.aid,
      cid: payload.cid,
      gid: payload.gid,
    };
  }
}
