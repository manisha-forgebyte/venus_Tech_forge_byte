import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'puttugunasekhar@forgebyte.ai';
  const password = await bcrypt.hash('Latha@2004', 10);

  const roles = [
    { gid: 1, name: 'Site Admin', rolename: 'Site Admin' },
    { gid: 2, name: 'Account Admin', rolename: 'Account Admin' },
    { gid: 3, name: 'Company User', rolename: 'Company User' },
    { gid: 4, name: 'Read Only User', rolename: 'Read Only User' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { gid: role.gid },
      update: {
        name: role.name,
        rolename: role.rolename,
        isActive: true,
      },
      create: role,
    });
  }

  await prisma.account.upsert({
    where: { aid: 1 },
    update: {
      name: 'Venus Demo Account',
      accName: 'Venus Demo Account',
      accountName: 'Venus Demo Account',
      url: 'https://www.venustechllc.com',
      isActive: true,
    },
    create: {
      aid: 1,
      name: 'Venus Demo Account',
      accName: 'Venus Demo Account',
      accountName: 'Venus Demo Account',
      url: 'https://www.venustechllc.com',
    },
  });

  await prisma.accountGroup.upsert({
    where: { agid: 1 },
    update: {
      aid: 1,
      gid: 1,
      name: 'Default Group',
      groupname: 'Default Group',
      isActive: true,
    },
    create: {
      agid: 1,
      aid: 1,
      gid: 1,
      name: 'Default Group',
      groupname: 'Default Group',
    },
  });

  await prisma.company.upsert({
    where: { cid: 1 },
    update: {
      aid: 1,
      agid: 1,
      companyId: 'VENUS-DEMO',
      companyName: 'Venus Demo Company',
      fullName: 'Venus Demo Company',
      tradingName: 'Venus Demo Company',
      isActive: true,
    },
    create: {
      cid: 1,
      aid: 1,
      agid: 1,
      companyId: 'VENUS-DEMO',
      companyName: 'Venus Demo Company',
      fullName: 'Venus Demo Company',
      tradingName: 'Venus Demo Company',
    },
  });

  await prisma.companyFilingFlags.upsert({
    where: { cid: 1 },
    update: {
      includeAssets: true,
      includeEntities: true,
      includeFilings: true,
    },
    create: {
      cid: 1,
      includeAssets: true,
      includeEntities: true,
      includeFilings: true,
    },
  });

  const lookups = [
    { table: 'role', value: '1', text: 'Site Admin' },
    { table: 'role', value: '2', text: 'Account Admin' },
    { table: 'role', value: '3', text: 'Company User' },
    { table: 'role', value: '4', text: 'Read Only User' },
    { table: 'accountgroup', value: '1', text: 'Default Group', aid: 1 },
    { table: 'status', value: 'active', text: 'Active' },
    { table: 'status', value: 'inactive', text: 'Inactive' },
  ];

  for (const lookup of lookups) {
    const existing = await prisma.commonLookup.findFirst({
      where: {
        table: lookup.table,
        value: lookup.value,
        text: lookup.text,
        aid: lookup.aid ?? null,
      },
    });

    if (existing) {
      await prisma.commonLookup.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          aid: lookup.aid ?? null,
        },
      });
    } else {
      await prisma.commonLookup.create({
        data: lookup,
      });
    }
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Local Admin',
      password,
      role: 'Site Admin',
      aid: 1,
      cid: 1,
      gid: 1,
      isActive: true,
    },
    create: {
      name: 'Local Admin',
      email: adminEmail,
      password,
      role: 'Site Admin',
      aid: 1,
      cid: 1,
      gid: 1,
      isActive: true,
    },
  });

  await prisma.user.updateMany({
    where: { email: 'admin@venu.tech' },
    data: { isActive: false },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
