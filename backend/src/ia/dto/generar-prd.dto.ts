import { IsString } from 'class-validator';

export class GenerarPrdDto {
  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;
}