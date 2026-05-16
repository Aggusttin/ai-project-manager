import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email no válido' })
  email: string;

  @IsNotEmpty({ message: 'El código es requerido' })
  codigo: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/, {
    message: 'La nueva contraseña no cumple con los requisitos de seguridad',
  })
  nuevaPassword: string;
}