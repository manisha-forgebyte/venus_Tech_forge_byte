import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CompatibilityController } from './compatibility.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CompatibilityController],
})
export class CompatibilityModule {}
