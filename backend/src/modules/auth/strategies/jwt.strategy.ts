import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {
    super({
      // Extract token from request header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Ignore expired token = false
      ignoreExpiration: false,

      // Secret key for JWT signing
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  // Validate decoded JWT payload
  async validate(payload: any) {

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}