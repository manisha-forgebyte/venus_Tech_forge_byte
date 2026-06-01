import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller()
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post(['auth/register', 'api/auth/register'])
  @HttpCode(201)
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Post(['auth/login', 'api/Login/GetLogin'])
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  @Post(['auth/refresh', 'api/Login/RefreshToken'])
  @HttpCode(200)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post(['auth/logout', 'api/Login/Logout'])
  @HttpCode(200)
  async logout() {
    return this.authService.logout();
  }
}
