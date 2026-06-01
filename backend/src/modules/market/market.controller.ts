import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('imss')
  getImss(@Query('cid') cid?: string) {
    return this.marketService.listImss(cid ? Number(cid) : undefined);
  }

  @Get('imss/:pid')
  getImssById(@Param('pid') pid: string) {
    return this.marketService.findImss(Number(pid));
  }

  @Post('imss')
  saveImss(@Body() body: any) {
    return this.marketService.saveImss(body);
  }

  @Delete('imss/:pid')
  deactivateImss(@Param('pid') pid: string) {
    return this.marketService.deactivateImss(Number(pid));
  }

  @Get('ipss')
  getIpss(@Query('cid') cid?: string) {
    return this.marketService.listIpss(cid ? Number(cid) : undefined);
  }

  @Get('ipss/:pid')
  getIpssById(@Param('pid') pid: string) {
    return this.marketService.findIpss(Number(pid));
  }

  @Post('ipss')
  saveIpss(@Body() body: any) {
    return this.marketService.saveIpss(body);
  }

  @Delete('ipss/:pid')
  deactivateIpss(@Param('pid') pid: string) {
    return this.marketService.deactivateIpss(Number(pid));
  }

  @Get('mitigations')
  getMitigations(@Query('cid') cid?: string) {
    return this.marketService.listMitigations(cid ? Number(cid) : undefined);
  }

  @Get('mitigations/:pid')
  getMitigationById(@Param('pid') pid: string) {
    return this.marketService.findMitigation(Number(pid));
  }

  @Post('mitigations')
  saveMitigation(@Body() body: any) {
    return this.marketService.saveMitigation(body);
  }

  @Delete('mitigations/:pid')
  deactivateMitigation(@Param('pid') pid: string) {
    return this.marketService.deactivateMitigation(Number(pid));
  }

  @Get('self-limitations')
  getSelfLimitations(@Query('cid') cid?: string) {
    return this.marketService.listSelfLimitations(cid ? Number(cid) : undefined);
  }

  @Get('self-limitations/:pid')
  getSelfLimitationById(@Param('pid') pid: string) {
    return this.marketService.findSelfLimitation(Number(pid));
  }

  @Post('self-limitations')
  saveSelfLimitation(@Body() body: any) {
    return this.marketService.saveSelfLimitation(body);
  }

  @Delete('self-limitations/:pid')
  deactivateSelfLimitation(@Param('pid') pid: string) {
    return this.marketService.deactivateSelfLimitation(Number(pid));
  }

  @Get('operating-reserves')
  getOperatingReserves(@Query('cid') cid?: string) {
    return this.marketService.listOperatingReserves(cid ? Number(cid) : undefined);
  }

  @Get('operating-reserves/:pid')
  getOperatingReserve(@Param('pid') pid: string) {
    return this.marketService.findOperatingReserve(Number(pid));
  }

  @Post('operating-reserves')
  saveOperatingReserve(@Body() body: any) {
    return this.marketService.saveOperatingReserve(body);
  }

  @Delete('operating-reserves/:pid')
  deactivateOperatingReserve(@Param('pid') pid: string) {
    return this.marketService.deactivateOperatingReserve(Number(pid));
  }
}
