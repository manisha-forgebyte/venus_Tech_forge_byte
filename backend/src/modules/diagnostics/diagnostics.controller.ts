import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('api/diagnostics')
export class DiagnosticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db')
  async checkDatabase() {
    try {
      const userCount = await this.prisma.user.count();
      const roleCount = await this.prisma.role.count();
      const adminUser = await this.prisma.user.findUnique({
        where: { email: 'puttugunasekhar@forgebyte.ai' },
        select: { email: true, name: true, role: true, isActive: true },
      });

      return {
        success: true,
        database: {
          connected: true,
          userCount,
          roleCount,
          adminUserExists: !!adminUser,
          adminUser: adminUser || null,
        },
      };
    } catch (error) {
      return {
        success: false,
        database: {
          connected: false,
          error: String(error?.message || error),
        },
      };
    }
  }
}
