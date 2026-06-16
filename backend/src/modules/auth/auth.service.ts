import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { getJwtRefreshSecret, getJwtSecret } from '../../config/jwt.config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
      name,
        email: normalizedEmail,
      password: hashedPassword,
      },
    });

    return {
      message: 'User registered successfully',
      user: this.toSafeUser(newUser),
    };
  }

  async validateUser(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    return this.buildAuthResponse(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const token = refreshTokenDto.refreshToken || refreshTokenDto.token;

    if (!token) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: getJwtRefreshSecret(),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout() {
    return {
      message: 'Logged out successfully',
    };
  }

  private buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      uid: user.uid,
      email: user.email,
      role: user.role,
      aid: user.aid,
      cid: user.cid,
      gid: user.gid,
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier':
        user.uid,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: getJwtSecret(),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: getJwtRefreshSecret(),
      expiresIn: '7d',
    });

    const safeUser = this.toSafeUser(user);

    return {
      user: safeUser,
      access_token: accessToken,
      token: accessToken,
      refresh_token: refreshToken,
      refreshToken,
      expires_in: 3600,
      expiresIn: 3600,
      uid: safeUser.uid,
      aid: safeUser.aid,
      cid: safeUser.cid,
      gid: safeUser.gid,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    };
  }

  private toSafeUser(user: User) {
    const { firstName, lastName } = this.parseName(user.name);
    return {
      id: user.id,
      uid: user.uid,
      name: user.name,
      firstName,
      lastName,
      email: user.email,
      workPhone: user.phone || '',
      mobilePhone: user.mobile || '',
      phone: user.phone || '',
      mobile: user.mobile || '',
      role: user.role,
      aid: user.aid,
      cid: user.cid,
      gid: user.gid,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private parseName(name: string) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) {
      return { firstName: parts[0] || '', lastName: '' };
    }
    return {
      firstName: parts.slice(0, -1).join(' '),
      lastName: parts.slice(-1).join(' '),
    };
  }
}
