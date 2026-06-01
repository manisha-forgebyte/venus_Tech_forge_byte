import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

  constructor() {

    // Use email instead of username
    super({
      usernameField: 'email',
    });
  }

  // Validate login credentials
  async validate(email: string, password: string) {

    // Temporary validation logic
    if (!email || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Temporary user response
    return {
      email,
    };
  }
}