import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { FilingsController } from './filings.controller';
import { FilingsService } from './filings.service';

@Module({
  imports: [PrismaModule],
  controllers: [FilingsController],
  providers: [FilingsService],
  exports: [FilingsService],
})
export class FilingsModule {}
