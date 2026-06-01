import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll(@Query('aid') aid?: string, @Query('activeOnly') activeOnly?: string) {
    return this.companiesService.findAll(
      aid ? Number(aid) : undefined,
      activeOnly === undefined ? true : activeOnly === 'true',
    );
  }

  @Get(':cid')
  findOne(@Param('cid') cid: string) {
    return this.companiesService.findOne(Number(cid));
  }

  @Post()
  save(@Body() body: any) {
    return this.companiesService.save(body);
  }

  @Delete(':cid')
  deactivate(@Param('cid') cid: string) {
    return this.companiesService.deactivate(Number(cid));
  }
}
