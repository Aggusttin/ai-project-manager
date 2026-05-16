import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recurso } from './recurso.entity';
import { CreateRecursoDto } from './dto/create-recurso.dto';

@Injectable()
export class RecursosService {
  constructor(
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
  ) {}

  async create(createRecursoDto: CreateRecursoDto, user: any): Promise<Recurso> {
    try {
      // Creamos el objeto mapeando las propiedades manualmente para asegurar compatibilidad
      const nuevoRecurso = this.recursoRepository.create({
        nombre: createRecursoDto.nombre,
        url_path: createRecursoDto.url_path,
        tipo: createRecursoDto.tipo,
        proyecto_id: createRecursoDto.proyecto_id,
        user_id: user.sub || user.id, // Probamos con .sub que es común en JWT de Nest
        metadata: createRecursoDto.metadata || {},
      });

      return await this.recursoRepository.save(nuevoRecurso);
    } catch (error) {
      // ESTO ES LO IMPORTANTE: Imprime el error real en tu consola negra/terminal
      console.error('--- ERROR EN BASE DE DATOS ---');
      console.error(error.message);
      console.error('------------------------------');
      
      throw new InternalServerErrorException({
        message: 'Error al guardar el recurso',
        detail: error.message, // Esto te dirá si falta una columna o si el ID está mal
      });
    }
  }

  async findAllByProyecto(proyecto_id: number): Promise<Recurso[]> {
    return await this.recursoRepository.find({
      where: { proyecto_id },
      order: { fecha_creacion: 'DESC' },
    });
  }
}