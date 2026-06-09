import { IsEnum } from 'class-validator';
import { EstadoUS } from '../user-story.entity';

export class UpdateEstadoDto {
  @IsEnum(EstadoUS)
  nuevoEstado: EstadoUS;
}