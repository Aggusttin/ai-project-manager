import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateUserStoryDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @IsOptional()
  prioridad?: number;

  @IsInt()
  @IsOptional()
  estimacion?: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsInt()
  @IsNotEmpty()
  proyectoId: number;

  // 🔥 NUEVOS CAMPOS (CLAVE)

  @IsString()
  @IsOptional()
  source?: string;

  @IsNumber()
  @IsOptional()
  confianza_US?: number;

  @IsNumber()
  @IsOptional()
  confianza_Estimacion?: number;
}