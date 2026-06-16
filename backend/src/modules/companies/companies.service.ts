import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

 async findAll(aid?: number, activeOnly = true) {
  console.log('FINDALL CALLED');

  const companies = await this.prisma.company.findMany({
    where: {
      ...(aid ? { aid } : {}),
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: {
      cid: 'asc',
    },
  });

  const users = await this.prisma.user.findMany();

  return companies.map((company) => {
    const userCount = users.filter((user) => {
      const companyIds = (user.companyIds || '')
        .split(',')
        .map((id: string) => id.trim());

      return companyIds.includes(String(company.cid));
    }).length;

    console.log(
      'CID:',
      company.cid,
      'UserCount:',
      userCount
    );

    return {
      ...company,
      userCount,
      users: userCount,
    };
  });
}

  async findOne(cid: number) {
    const company = await this.prisma.company.findUnique({ where: { cid } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async save(data: any) {
    const cid = Number(data.cid || data.CID || 0);
    const companyId = typeof data.companyId === 'string'
      ? data.companyId.trim()
      : typeof data.company_id === 'string'
        ? data.company_id.trim()
        : typeof data.CompanyID === 'string'
          ? data.CompanyID.trim()
          : '';
    const persistedData = this.cleanData(data);
    let effectiveCid = cid;

    if (!effectiveCid && companyId) {
      const existing = await this.prisma.company.findFirst({ where: { companyId } });
      if (existing?.cid) {
        effectiveCid = existing.cid;
      }
    }

    const company = effectiveCid
      ? await this.prisma.company.upsert({
        where: { cid: effectiveCid || cid },
        update: {
          ...data,
          companyId: companyId || null,
          data: persistedData,
        },
        create: {
          ...data,
          cid: effectiveCid || cid,
          companyId: companyId || null,
          data: persistedData,
        },
      })
      : await this.prisma.company.create({
        data: {
          ...data,
          companyId: companyId || null,
          data: persistedData,
        },
      });
    return this.withResultId(company);
  }

  async deactivate(cid: number) {
    const company = await this.prisma.company.update({
      where: { cid },
      data: { isActive: false },
    });
    return this.withResultId(company);
  }

  private withResultId(company: any) {
    return {
      ...company,
      resultId: company.cid,
      ResultId: company.cid,
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
