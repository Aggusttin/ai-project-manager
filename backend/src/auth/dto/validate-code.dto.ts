import { IsEmail, IsNotEmpty } from 'class-validator';

export class ValidateCodeDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  codigo: string;
}