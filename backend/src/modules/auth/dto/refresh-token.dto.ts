import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsString()
  @IsOptional()
  token?: string;
}
