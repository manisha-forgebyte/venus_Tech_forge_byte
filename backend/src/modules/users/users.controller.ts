import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('cid') cid?: string, @Query('isActive') isActive?: string) {
    return this.usersService.findAll(
      cid ? Number(cid) : undefined,
      isActive === undefined ? undefined : isActive === 'true',
    );
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.usersService.findOne(Number(uid));
  }

  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put(':uid')
  update(@Param('uid') uid: string, @Body() body: any) {
    return this.usersService.update(Number(uid), body);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.usersService.softDelete(Number(uid));
  }
}
