import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cid?: number) {
    return this.prisma.entity.findMany({
      where: { ...(cid ? { cid } : {}) },
      orderBy: { entityid: 'asc' },
    });
  }

  async findOne(entityid: number) {
    const entity = await this.prisma.entity.findUnique({ where: { entityid } });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async save(data: any) {
    const entityid = Number(data.entityid || data.EntityId || data.entityId || data.id || 0);
    const cid = Number(data.cid || data.Cid || 1);
    const gid = Number(data.gid || data.Gid || 1);
    const persistedData = this.cleanData(data);
    const payload = {
      ...data,
      cid: cid || 1,
      gid: gid || 1,
      name: data.name || data.entityName || data.title || 'Entity',
      entityName: data.entityName || data.name || data.title || 'Entity',
      data: persistedData,
    };
    const entity = entityid
      ? await this.prisma.entity.upsert({
        where: { entityid },
        update: payload,
        create: { ...payload, entityid },
      })
      : await this.prisma.entity.create({ data: payload });
    return this.withResultId(entity);
  }

  async deactivate(entityid: number) {
    const entity = await this.prisma.entity.update({
      where: { entityid },
      data: { isActive: false },
    });
    return this.withResultId(entity);
  }

  private withResultId(entity: any) {
    return {
      ...entity,
      resultId: entity.entityid,
      ResultId: entity.entityid,
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
