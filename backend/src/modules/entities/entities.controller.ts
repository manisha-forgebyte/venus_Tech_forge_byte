import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { EntitiesService } from './entities.service';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  findAll(@Query('cid') cid?: string) {
    return this.entitiesService.findAll(cid ? Number(cid) : undefined);
  }

  @Get(':entityid')
  findOne(@Param('entityid') entityid: string) {
    return this.entitiesService.findOne(Number(entityid));
  }

  @Post()
  save(@Body() body: any) {
    return this.entitiesService.save(body);
  }

  @Delete(':entityid')
  deactivate(@Param('entityid') entityid: string) {
    return this.entitiesService.deactivate(Number(entityid));
  }
}
