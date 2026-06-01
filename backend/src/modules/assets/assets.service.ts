import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cid?: number) {
    return this.prisma.asset.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { assetid: 'asc' },
    });
  }

  async findOne(assetid: number) {
    const asset = await this.prisma.asset.findUnique({ where: { assetid } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async save(data: any) {
    const assetid = Number(data.assetid || data.AssetId || data.assetId || data.id || 0);
    const cid = Number(data.cid || data.Cid || 1);
    const gid = Number(data.gid || data.Gid || 1);
    const persistedData = this.cleanData(data);
    const payload = {
      ...data,
      cid: cid || 1,
      gid: gid || 1,
      name: data.name || data.genName || data.assetName || data.title || 'Asset',
      assetName: data.assetName || data.genName || data.name || data.title || 'Asset',
      data: persistedData,
    };
    const asset = assetid
      ? await this.prisma.asset.upsert({
        where: { assetid },
        update: {
          ...payload,
        },
        create: {
          ...payload,
          assetid,
        },
      })
      : await this.prisma.asset.create({ data: payload });
    return this.withResultId(asset);
  }

  async deactivate(assetid: number) {
    const asset = await this.prisma.asset.update({
      where: { assetid },
      data: { isActive: false },
    });
    return this.withResultId(asset);
  }

  private withResultId(asset: any) {
    return {
      ...asset,
      resultId: asset.assetid,
      ResultId: asset.assetid,
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
