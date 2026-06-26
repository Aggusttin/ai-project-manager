import { IsString } from 'class-validator';

export class GenerarUserStoriesDto {
  @IsString()
  contexto: string;
}