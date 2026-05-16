import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  nombre: string;

  @IsNotEmpty()
  apellido: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(8, {
    message: 'Debe tener al menos 8 caracteres',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Debe tener al menos una mayúscula',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Debe tener al menos una minúscula',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Debe tener al menos un número',
  })
  @Matches(/(?=.*[^A-Za-z0-9])/, {
    message: 'Debe tener al menos un símbolo',
  })
  password: string;
}