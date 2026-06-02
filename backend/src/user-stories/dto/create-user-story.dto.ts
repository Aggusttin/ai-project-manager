import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';

import { EstadoUS } from '../user-story.entity';

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

  @IsInt()
  @IsOptional()
  puntos_historia?: number;

  @IsEnum(EstadoUS)
  @IsOptional()
  estado?: EstadoUS;

  @IsInt()
  @IsNotEmpty()
  proyectoId: number;

  // ======================================================
  // IA
  // ======================================================

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