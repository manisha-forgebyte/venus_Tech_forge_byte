import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {

  // New password validation
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;

  // Reset token validation
  @IsString()
  @IsNotEmpty()
  resetToken!: string;
}