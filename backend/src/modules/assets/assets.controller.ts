import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Query('cid') cid?: string) {
    return this.assetsService.findAll(cid ? Number(cid) : undefined);
  }

  @Get(':assetid')
  findOne(@Param('assetid') assetid: string) {
    return this.assetsService.findOne(Number(assetid));
  }

  @Post()
  save(@Body() body: any) {
    return this.assetsService.save(body);
  }

  @Delete(':assetid')
  deactivate(@Param('assetid') assetid: string) {
    return this.assetsService.deactivate(Number(assetid));
  }
}
