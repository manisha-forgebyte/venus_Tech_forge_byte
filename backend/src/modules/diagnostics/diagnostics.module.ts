import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DiagnosticsController } from './diagnostics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DiagnosticsController],
})
export class DiagnosticsModule {}
