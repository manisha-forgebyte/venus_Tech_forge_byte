import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cid?: number, isActive?: boolean) {
    return this.prisma.user.findMany({
      where: {
        ...(cid ? { cid } : {}),
        ...(isActive === undefined ? {} : { isActive }),
      },
      orderBy: { uid: 'asc' },
    });
  }

  async findOne(uid: number) {
    const user = await this.prisma.user.findUnique({ where: { uid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(data: Partial<User> & { password?: string }) {
    const uid = Number((data as any).uid || (data as any).Uid || (data as any).id || 0);
    const email = this.normalizeEmail((data as any).email || (data as any).Email || (data as any).eMail);
    const password = typeof (data as any).password === 'string' && (data as any).password.trim()
      ? await bcrypt.hash((data as any).password.trim(), 10)
      : undefined;
    const payload = this.buildPayload(data);
    const name = payload.name || email || 'User';
    const createData: any = {
      ...payload,
      name,
      email: email || payload.email || `user-${Date.now()}@local`,
    };
    const updateData: any = { ...payload };

    const user = uid
      ? await this.prisma.user.upsert({
          where: { uid },
          update: {
            ...updateData,
            ...(password ? { password } : {}),
          } as any,
          create: {
            ...createData,
            uid,
            ...(password ? { password } : {}),
          } as any,
        })
      : email
        ? await this.prisma.user.upsert({
            where: { email },
            update: {
              ...updateData,
              ...(password ? { password } : {}),
            } as any,
            create: {
              ...createData,
              email,
              ...(password ? { password } : {}),
            } as any,
          })
        : await this.prisma.user.create({
            data: {
              ...createData,
              ...(password ? { password } : {}),
            } as any,
          });
    return this.withResultId(user);
  }

  async update(uid: number, data: Partial<User>) {
    const password = typeof (data as any).password === 'string' && (data as any).password.trim()
      ? await bcrypt.hash((data as any).password.trim(), 10)
      : undefined;
    const user = await this.prisma.user.update({
      where: { uid },
      data: {
        ...this.buildPayload(data),
        ...(password ? { password } : {}),
      } as any,
    });
    return this.withResultId(user);
  }

  async softDelete(uid: number) {
    const user = await this.prisma.user.update({
      where: { uid },
      data: { isActive: false },
    });
    return this.withResultId(user);
  }

  private withResultId(user: User) {
    return {
      ...user,
      resultId: user.uid,
      ResultId: user.uid,
    };
  }

  private buildPayload(data: Partial<User>) {
    const payload: Record<string, any> = {
      ...data,
      name: (data as any).name || (data as any).Name || (data as any).fullName || (data as any).username || (data as any).email || (data as any).Email || 'User',
      email: this.normalizeEmail((data as any).email || (data as any).Email || (data as any).eMail) || undefined,
      role: (data as any).role || 'Company User',
      aid: Number((data as any).aid || (data as any).Aid || 1),
      cid: Number((data as any).cid || (data as any).Cid || 1),
      gid: Number((data as any).gid || (data as any).Gid || 3),
      isActive: (data as any).isActive === undefined ? true : Boolean((data as any).isActive),
    };

    delete payload.Password;
    delete payload.Email;
    delete payload.Uid;
    delete payload.id;
    delete payload.uid;

    return payload;
  }

  private normalizeEmail(value: unknown) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  }
}
