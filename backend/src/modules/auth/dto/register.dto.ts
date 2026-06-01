import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {

  // User full name
  @IsString()
  @IsNotEmpty()
  name!: string;

  // User email validation
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  // Password validation
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}