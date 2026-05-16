import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, IsObject } from 'class-validator';

export class CreateRecursoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  url_path: string;

  @IsString()
  @IsNotEmpty()
  tipo: string; // Ejemplo: 'documento', 'audio', 'link'

  @IsInt()
  @IsNotEmpty()
  proyecto_id: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}