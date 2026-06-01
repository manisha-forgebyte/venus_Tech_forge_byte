import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {

  // Validate user email
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}