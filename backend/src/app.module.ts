import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { CompatibilityModule } from './modules/compatibility/compatibility.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { FilingsModule } from './modules/filings/filings.module';
import { MarketModule } from './modules/market/market.module';
import { ReserveModule } from './modules/reserve/reserve.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Authentication module
    AuthModule,
    UsersModule,
    CompaniesModule,
    AssetsModule,
    EntitiesModule,
    FilingsModule,
    MarketModule,
    ReserveModule,
    PrismaModule,
    CompatibilityModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
