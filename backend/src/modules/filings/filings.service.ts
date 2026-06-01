import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cid?: number) {
    return this.prisma.filing.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { fid: 'asc' },
    });
  }

  async findOne(fid: number) {
    const filing = await this.prisma.filing.findUnique({ where: { fid } });
    if (!filing) {
      throw new NotFoundException('Filing not found');
    }
    return filing;
  }

  async save(data: any) {
    const fid = Number(data.fid || data.FID || data.filingId || data.id || 0);
    const persistedData = this.cleanData(data);
    const payload = {
      ...data,
      cid: Number(data.cid || data.Cid || 1),
      uid: data.uid === undefined || data.uid === null || data.uid === '' ? undefined : Number(data.uid),
      status: data.status || data.Status || 'Draft',
      isActive: data.isActive === undefined ? true : Boolean(data.isActive),
      data: persistedData,
    };
    const filing = fid
      ? await this.prisma.filing.upsert({
        where: { fid },
        update: payload,
        create: { ...payload, fid },
      })
      : await this.prisma.filing.create({ data: payload });
    return this.withResultId(filing);
  }

  private withResultId(filing: any) {
    return {
      ...filing,
      resultId: filing.fid,
      ResultId: filing.fid,
    };
  }

  private cleanData(data: any) {
    const clone = { ...(data || {}) };
    delete clone.password;
    delete clone.Password;
    delete clone.token;
    delete clone.refreshToken;
    delete clone.access_token;
    delete clone.accessToken;
    return clone;
  }
}
