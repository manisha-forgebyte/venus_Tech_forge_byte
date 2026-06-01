import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

type AnyRecord = Record<string, any>;

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  listImss(cid?: number) {
    return this.prisma.indicativeMarketScreenStudy.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { pid: 'asc' },
    });
  }

  async findImss(pid: number) {
    const record = await this.prisma.indicativeMarketScreenStudy.findUnique({ where: { pid } });
    if (!record) {
      throw new NotFoundException('IMSS record not found');
    }
    return record;
  }

  async saveImss(data: AnyRecord) {
    return this.saveStudy('imss', data);
  }

  async deactivateImss(pid: number) {
    return this.deactivateStudy('imss', pid);
  }

  listIpss(cid?: number) {
    return this.prisma.indicativePowerSupplyStudy.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { pid: 'asc' },
    });
  }

  async findIpss(pid: number) {
    const record = await this.prisma.indicativePowerSupplyStudy.findUnique({ where: { pid } });
    if (!record) {
      throw new NotFoundException('IPSS record not found');
    }
    return record;
  }

  async saveIpss(data: AnyRecord) {
    return this.saveStudy('ipss', data);
  }

  async deactivateIpss(pid: number) {
    return this.deactivateStudy('ipss', pid);
  }

  listMitigations(cid?: number) {
    return this.prisma.mitigation.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { pid: 'asc' },
    });
  }

  async findMitigation(pid: number) {
    const record = await this.prisma.mitigation.findUnique({ where: { pid } });
    if (!record) {
      throw new NotFoundException('Mitigation not found');
    }
    return record;
  }

  async saveMitigation(data: AnyRecord) {
    return this.saveStudy('mitigation', data);
  }

  async deactivateMitigation(pid: number) {
    return this.deactivateStudy('mitigation', pid);
  }

  listSelfLimitations(cid?: number) {
    return this.prisma.selfLimitation.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { pid: 'asc' },
    });
  }

  async findSelfLimitation(pid: number) {
    const record = await this.prisma.selfLimitation.findUnique({ where: { pid } });
    if (!record) {
      throw new NotFoundException('Self limitation not found');
    }
    return record;
  }

  async saveSelfLimitation(data: AnyRecord) {
    return this.saveStudy('selfLimitation', data);
  }

  async deactivateSelfLimitation(pid: number) {
    return this.deactivateStudy('selfLimitation', pid);
  }

  listOperatingReserves(cid?: number) {
    return this.prisma.operatingReserve.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { pid: 'asc' },
    });
  }

  async findOperatingReserves(pid: number) {
    return this.findOperatingReserve(pid);
  }

  async saveOperatingReserve(data: any) {
    const pid = Number(data.pid || data.PID || 0);
    const reserve = pid
      ? await this.prisma.operatingReserve.upsert({
          where: { pid },
          update: this.buildStudyData('operatingReserve', data),
          create: { ...this.buildStudyData('operatingReserve', data), pid },
        })
      : await this.prisma.operatingReserve.create({ data: this.buildStudyData('operatingReserve', data) });
    return this.withResultId(reserve);
  }

  async findOperatingReserve(pid: number) {
    const reserve = await this.prisma.operatingReserve.findUnique({ where: { pid } });
    if (!reserve) {
      throw new NotFoundException('Operating reserve not found');
    }
    return reserve;
  }

  async deactivateOperatingReserve(pid: number) {
    const reserve = await this.prisma.operatingReserve.update({
      where: { pid },
      data: { isActive: false },
    });
    return this.withResultId(reserve);
  }

  private withResultId(reserve: any) {
    return {
      ...reserve,
      resultId: reserve.pid,
      ResultId: reserve.pid,
    };
  }

  private async saveStudy(kind: 'imss' | 'ipss' | 'mitigation' | 'selfLimitation', data: AnyRecord) {
    const pid = Number(data.pid || data.PID || data.id || 0);
    const payload = this.buildStudyData(kind, data);

    const model = this.modelForStudy(kind) as AnyRecord;
    const record = pid
      ? await model.upsert({
          where: { pid },
          update: payload,
          create: { ...payload, pid },
        })
      : await model.create({ data: payload });

    return this.withResultId(record);
  }

  private async deactivateStudy(kind: 'imss' | 'ipss' | 'mitigation' | 'selfLimitation', pid: number) {
    const model = this.modelForStudy(kind) as AnyRecord;
    const record = await model.update({
      where: { pid },
      data: { isActive: false },
    });
    return this.withResultId(record);
  }

  private buildStudyData(kind: 'imss' | 'ipss' | 'mitigation' | 'selfLimitation' | 'operatingReserve', data: AnyRecord) {
    const cid = Number(data.cid || data.CID || 0);
    const gid = Number(data.gid || data.GID || data.groupId || 1) || 1;
    const pid = Number(data.pid || data.PID || data.id || 0);
    const payload = this.cleanData(data);

    return {
      ...payload,
      cid,
      gid,
      isActive: data.isActive === undefined ? true : Boolean(data.isActive),
      data: payload,
      ...(pid ? { pid } : {}),
    };
  }

  private modelForStudy(kind: 'imss' | 'ipss' | 'mitigation' | 'selfLimitation') {
    switch (kind) {
      case 'imss':
        return this.prisma.indicativeMarketScreenStudy;
      case 'ipss':
        return this.prisma.indicativePowerSupplyStudy;
      case 'mitigation':
        return this.prisma.mitigation;
      case 'selfLimitation':
        return this.prisma.selfLimitation;
    }
  }

  private cleanData(data: AnyRecord) {
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
