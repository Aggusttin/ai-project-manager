import { IsString, IsNotEmpty, IsInt, IsArray } from 'class-validator';

export class CreatePrdDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsInt()
  @IsNotEmpty()
  proyecto_id: number;

  @IsArray()
  @IsInt({ each: true })
  user_stories_ids: number[]; // Recibimos los IDs de las historias para vincularlas
}