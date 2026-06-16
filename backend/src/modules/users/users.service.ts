import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_USER_PASSWORD = 'Password123';

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
    }).then((users) => users.map((user) => this.withResultId(user)));
  }

  async findOne(uidOrId: number | string) {
    if (uidOrId === undefined || uidOrId === null || uidOrId === '') {
      throw new NotFoundException('User not found');
    }

    let user = null as User | null;
    const normalizedUid = typeof uidOrId === 'number' ? uidOrId : Number(uidOrId);
    if (!Number.isNaN(normalizedUid) && Number.isFinite(normalizedUid)) {
      user = await this.prisma.user.findUnique({ where: { uid: normalizedUid } });
    }

    if (!user && typeof uidOrId === 'string') {
      user = await this.prisma.user.findUnique({ where: { id: uidOrId } });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.withResultId(user);
  }

  async getUserRoleTypes() {
    return this.prisma.role.findMany({
      where: { isActive: true },
      orderBy: { gid: 'asc' },
    });
  }

  async adminGetUserRoleTypes() {
    return this.prisma.role.findMany({
      orderBy: { gid: 'asc' },
    });
  }

  private async getRoleNameByGid(gid: number): Promise<string | undefined> {
    if (!gid) return undefined;
    const role = await this.prisma.role.findUnique({
      where: { gid }
    });
    return role ? role.rolename : undefined;
  }

  async create(data: Partial<User> & { password?: string }) {
    const uid = Number((data as any).uid || (data as any).Uid || (data as any).id || 0);
    const email = this.normalizeEmail((data as any).email || (data as any).Email || (data as any).eMail);
    const requestedPassword = typeof (data as any).password === 'string' ? (data as any).password.trim() : '';
    
    let createPassword = process.env.DEFAULT_USER_PASSWORD || DEFAULT_USER_PASSWORD;
    if (requestedPassword) {
      if (requestedPassword.startsWith('$2') && requestedPassword.length >= 50) {
        createPassword = requestedPassword;
      } else {
        createPassword = await bcrypt.hash(requestedPassword, 10);
      }
    } else {
      createPassword = await bcrypt.hash(createPassword, 10);
    }

    const createData: any = this.buildPayload(data, false);
    
    // Look up role name if gid is provided and role string is missing
    if (createData.gid && !createData.role) {
      const roleName = await this.getRoleNameByGid(createData.gid);
      if (roleName) createData.role = roleName;
    }

    if (email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.uid !== uid) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // console.log('====================');
    // console.log('CREATE USER REQUEST');
    // console.log('EMAIL:', email);
    // console.log('CID:', createData.cid);
    // console.log('COMPANY IDS:', createData.companyIds);
    // console.log('GID:', createData.gid);                    //future need to deletle
    // console.log('CREATE DATA:', createData);
    // console.log('====================');

    const user = uid
      ? await this.prisma.user.upsert({
          where: { uid },
          update: {
            ...createData,
          } as any,
          create: {
            ...createData,
            uid,
            email: email || createData.email || `user-${Date.now()}@local`,
            password: createPassword,
          } as any,
        })
      : await this.prisma.user.create({
          data: {
            ...createData,
            email: email || createData.email || `user-${Date.now()}@local`,
            password: createPassword,
          } as any,
        });
    // console.log('====================');
    // console.log('USER SAVED');
    // console.log('UID:', user.uid);
    // console.log('CID:', user.cid);
    // console.log('COMPANY IDS:', user.companyIds);
    // console.log('EMAIL:', user.email);
    // console.log(user);
    // console.log('====================');

    return this.withResultId(user);
  }

  async update(uidOrId: number | string, data: Partial<User>) {
    if (uidOrId === undefined || uidOrId === null || uidOrId === '') {
      throw new NotFoundException('User not found');
    }

    let password: string | undefined = undefined;
    const requestedPassword = typeof (data as any).password === 'string' ? (data as any).password.trim() : '';
    if (requestedPassword) {
      if (requestedPassword.startsWith('$2') && requestedPassword.length >= 50) {
        password = requestedPassword;
      } else {
        password = await bcrypt.hash(requestedPassword, 10);
      }
    }

    const updateData = this.buildPayload(data, true);
    
    // Look up role name if gid is provided and role string is missing or needs updating
    if (updateData.gid && !updateData.role) {
      const roleName = await this.getRoleNameByGid(updateData.gid);
      if (roleName) updateData.role = roleName;
    }

    const where = this.getUserWhereClause(uidOrId);
    const currentUser = await this.prisma.user.findUnique({ where });
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    if (updateData.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email: updateData.email } });
      if (existingUser && existingUser.uid !== currentUser.uid) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const user = await this.prisma.user.update({
      where,
      data: {
        ...updateData,
        ...(password ? { password } : {}),
      } as any,
    });
    return this.withResultId(user);
  }

  async softDelete(uidOrId: number | string) {
    const where = this.getUserWhereClause(uidOrId);
    const user = await this.prisma.user.update({
      where,
      data: { isActive: false },
    });
    return this.withResultId(user);
  }

  async activateUsers(cid: number, uiDs: string) {
    const ids = uiDs.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) return { count: 0 };
    
    return this.prisma.user.updateMany({
      where: {
        cid: cid,
        uid: { in: ids }
      },
      data: { isActive: true }
    });
  }

  async hardDeleteUsers(cid: number, uiDs: string) {
    const ids = uiDs.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) return { count: 0 };
    
    return this.prisma.user.deleteMany({
      where: {
        cid: cid,
        uid: { in: ids },
        isActive: false
      }
    });
  }

  private getUserWhereClause(uidOrId: number | string) {
    if (typeof uidOrId === 'number') {
      return { uid: uidOrId };
    }

    const numeric = Number(uidOrId);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      return { uid: numeric };
    }

    return { id: uidOrId };
  }

  private withResultId(user: User) {
    const { firstName, lastName } = this.parseName(user.name);

    return {
      id: user.id,
      uid: user.uid,
      Uid: user.uid,
      UID: user.uid,
      userId: user.uid,
      userID: user.uid,
      ID: user.uid,
      name: user.name,
      UserName: user.name,
      fullName: user.name,
      firstName,
      first_name: firstName,
      FirstName: firstName,
      fName: firstName,
      lastName,
      last_name: lastName,
      LastName: lastName,
      lName: lastName,
      email: user.email,
      eMail: user.email,
      Email: user.email,
      role: user.role,
      rolename: user.role,
      aid: user.aid,
      Aid: user.aid,
      cid: user.cid,
      Cid: user.cid,
      gid: user.gid,
      Gid: user.gid,
      isActive: user.isActive,
      active: user.isActive,
      phone: user.phone || '',
      workPhone: user.phone || '',
      mobile: user.mobile || '',
      mobilePhone: user.mobile || '',
      isLocked: user.isLocked,
      locked: user.isLocked,
      companyIds: user.companyIds || '',
      CompanyIds: user.companyIds || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      resultId: user.uid,
      ResultId: user.uid,
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

  private buildPayload(data: Partial<User>, isUpdate = false) {
    const payload: Record<string, any> = {};

    const firstName = (data as any).firstName || (data as any).FirstName || (data as any).first_name || (data as any).fname || '';
    const lastName = (data as any).lastName || (data as any).LastName || (data as any).last_name || (data as any).lname || '';
    const combinedName = `${firstName} ${lastName}`.trim();

    const name = (data as any).name || (data as any).Name || (data as any).fullName || (data as any).username || combinedName;
    if (name) payload.name = name;
    else if (!isUpdate) payload.name = (data as any).email || (data as any).Email || 'User';

    const rawEmail = (data as any).email || (data as any).Email || (data as any).eMail;
    if (rawEmail) payload.email = this.normalizeEmail(rawEmail);

    const rawRole = (data as any).role || (data as any).role_cd || (data as any).rolename || (data as any).userRole || (data as any).roleName;
    if (rawRole) payload.role = String(rawRole);

    const aidValue = (data as any).aid ?? (data as any).Aid ?? (data as any).AID;
    if (aidValue !== undefined) payload.aid = Number(aidValue);
    else if (!isUpdate) payload.aid = 1;

    const cidValue = (data as any).cid ?? (data as any).Cid ?? (data as any).CID;
    if (cidValue !== undefined) payload.cid = Number(cidValue);
    else if (!isUpdate) payload.cid = 1;

    const gidValue = (data as any).gid ?? (data as any).Gid ?? (data as any).GID ?? (data as any).roleGid;
    if (gidValue !== undefined) payload.gid = Number(gidValue);
    else if (!isUpdate) payload.gid = 3;

    if ((data as any).isActive !== undefined) payload.isActive = Boolean((data as any).isActive);
    else if (!isUpdate) payload.isActive = true;

    const phone = (data as any).phone || (data as any).Phone || (data as any).workPhone || (data as any).work_phone;
    if (phone !== undefined) payload.phone = String(phone);

    const mobile = (data as any).mobile || (data as any).Mobile || (data as any).mobilePhone || (data as any).mobile_phone;
    if (mobile !== undefined) payload.mobile = String(mobile);

    const isLocked = (data as any).isLocked !== undefined ? (data as any).isLocked : (data as any).locked;
    if (isLocked !== undefined) payload.isLocked = Boolean(isLocked);

    const companyIds = (data as any).companyIds || (data as any).CompanyIds;
    if (companyIds !== undefined) payload.companyIds = Array.isArray(companyIds) ? companyIds.join(',') : String(companyIds);

    return payload;
  }

  private normalizeEmail(value: unknown) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  }
}
