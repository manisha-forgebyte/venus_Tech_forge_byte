import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { ReserveController } from './reserve.controller';
import { ReserveService } from './reserve.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReserveController],
  providers: [ReserveService],
  exports: [ReserveService],
})
export class ReserveModule {}
