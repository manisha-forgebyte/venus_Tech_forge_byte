import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { getJwtSecret } from '../../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {
    super({
      // Extract token from request header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Ignore expired token = false
      ignoreExpiration: false,

      // Secret key for JWT signing
      secretOrKey: getJwtSecret(),
    });
  }

  // Validate decoded JWT payload
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
