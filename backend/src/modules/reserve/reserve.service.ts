import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReserveService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cid?: number) {
    return this.prisma.operatingReserve.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { pid: 'asc' },
    });
  }

  async findOne(pid: number) {
    const reserve = await this.prisma.operatingReserve.findUnique({ where: { pid } });
    if (!reserve) {
      throw new NotFoundException('Operating reserve not found');
    }
    return reserve;
  }

  async save(data: any) {
    const pid = Number(data.pid || data.PID || 0);
    const reserve = pid
      ? await this.prisma.operatingReserve.upsert({
        where: { pid },
        update: data,
        create: { ...data, pid },
      })
      : await this.prisma.operatingReserve.create({ data });
    return this.withResultId(reserve);
  }

  private withResultId(reserve: any) {
    return {
      ...reserve,
      resultId: reserve.pid,
      ResultId: reserve.pid,
    };
  }
}
