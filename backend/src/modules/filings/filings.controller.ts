import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { FilingsService } from './filings.service';

@Controller('filings')
export class FilingsController {
  constructor(private readonly filingsService: FilingsService) {}

  @Get()
  findAll(@Query('cid') cid?: string) {
    return this.filingsService.findAll(cid ? Number(cid) : undefined);
  }

  @Get(':fid')
  findOne(@Param('fid') fid: string) {
    return this.filingsService.findOne(Number(fid));
  }

  @Post()
  save(@Body() body: any) {
    return this.filingsService.save(body);
  }
}
