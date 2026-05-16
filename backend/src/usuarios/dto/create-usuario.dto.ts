import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsInt } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' }) // 👈 Agregado
  apellido: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' }) // 👈 Agregado
  username: string;

  @IsEmail({}, { message: 'El formato del email es incorrecto' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsInt()
  @IsOptional() 
  rolId?: number; 
}