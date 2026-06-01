import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ReserveService } from './reserve.service';

@Controller('reserve')
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  @Get()
  findAll(@Query('cid') cid?: string) {
    return this.reserveService.findAll(cid ? Number(cid) : undefined);
  }

  @Get(':pid')
  findOne(@Param('pid') pid: string) {
    return this.reserveService.findOne(Number(pid));
  }

  @Post()
  save(@Body() body: any) {
    return this.reserveService.save(body);
  }
}
