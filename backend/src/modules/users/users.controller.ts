import { BadRequestException, Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('api/User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('GetUserByUID/:uid')
  async getUserByID(@Param('uid') uid: string) {
    return await this.usersService.findOne(uid);
  }

  @Get('GetUserByID/:uid')
  async getUserByIDAlias(@Param('uid') uid: string) {
    return await this.usersService.findOne(uid);
  }

  @Get('GetListByCID/:cid')
  async getListByCID(@Param('cid', ParseIntPipe) cid: number) {
    return await this.usersService.findAll(cid, true);
  }

  @Get('GetInactiveUsersByCID/:cid')
  async getInactiveUsersByCID(@Param('cid', ParseIntPipe) cid: number) {
    return await this.usersService.findAll(cid, false);
  }

  @Get('GetUserRoleTypes')
  async getUserRoleTypes() {
    return await this.usersService.getUserRoleTypes();
  }

  @Get('AdminGetUserRoleTypes')
  async adminGetUserRoleTypes() {
    return await this.usersService.adminGetUserRoleTypes();
  }

  @Get()
  findAll(@Query('cid') cid?: string, @Query('isActive') isActive?: string) {
    return this.usersService.findAll(
      cid ? Number(cid) : undefined,
      isActive === undefined ? undefined : isActive === 'true',
    );
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.usersService.findOne(uid);
  }

  @Post('UpdateMyProfile')
  async updateMyProfilePost(@Body() data: Partial<User> & { uid?: number | string; UID?: number | string; Uid?: number | string; id?: number | string; userId?: number | string; userID?: number | string; modifiedUID?: number | string; modifiedUid?: number | string }) {
    const uid = data.uid ?? data.UID ?? data.Uid ?? data.id ?? data.userID ?? data.userId ?? data.modifiedUID ?? data.modifiedUid;
    if (uid === undefined || uid === null || uid === '') {
      throw new BadRequestException('User ID is required for profile update');
    }
    return this.usersService.update(uid, data);
  }

  @Post('CreateUser')
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Post('UpdateUser')
  updateUser(@Body() body: any) {
    const uid = body.uid ?? body.UID ?? body.Uid ?? body.id ?? body.userId ?? body.userID;
    if (uid === undefined || uid === null || uid === '') {
      throw new BadRequestException('User ID is required for user update');
    }
    return this.usersService.update(uid, body);
  }

  @Post('UpdateUserActivateByCID')
  updateUserActivateByCID(@Body() body: { cid: number, uiDs: string }) {
    return this.usersService.activateUsers(body.cid, body.uiDs);
  }

  @Post('DeleteUserInActivesByCID')
  deleteUserInActivesByCID(@Body() body: { cid: number, uiDs: string }) {
    return this.usersService.hardDeleteUsers(body.cid, body.uiDs);
  }

  @Post()
  createRoot(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put('UpdateMyProfile')
  async updateMyProfilePut(@Body() data: Partial<User> & { uid?: number | string; UID?: number | string; Uid?: number | string; id?: number | string; userId?: number | string; userID?: number | string; modifiedUID?: number | string; modifiedUid?: number | string }) {
    const uid = data.uid ?? data.UID ?? data.Uid ?? data.id ?? data.userID ?? data.userId ?? data.modifiedUID ?? data.modifiedUid;
    if (uid === undefined || uid === null || uid === '') {
      throw new BadRequestException('User ID is required for profile update');
    }
    return this.usersService.update(uid, data);
  }

  @Put(':uid')
  update(@Param('uid') uid: string, @Body() body: any) {
    return this.usersService.update(uid, body);
  }

  @Delete('DeleteByID/:uid')
  removeByID(@Param('uid') uid: string) {
    return this.usersService.softDelete(uid);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.usersService.softDelete(uid);
  }
}
