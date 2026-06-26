import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Contexto } from './contexto.entity';

import { RecursosService } from '../recursos/recursos.service';

@Injectable()
export class ContextosService {
  constructor(
    @InjectRepository(Contexto)
    private readonly contextoRepository: Repository<Contexto>,

    private readonly recursosService: RecursosService,
  ) {}

  async procesarProyecto(
    proyectoId: number,
  ) {
    const recursos =
      await this.recursosService.findAllByProyecto(
        proyectoId,
      );

    let contextoCompleto = '';

    for (const recurso of recursos) {
      try {
        const contenido =
          await this.recursosService.getContenidoParaIA(
            recurso.id,
          );

        contextoCompleto += `
==================================================
ARCHIVO: ${contenido.nombreArchivo}
TIPO: ${contenido.tipo}

${contenido.contenido}

`;
      } catch (error) {
        console.error(error);
      }
    }

    const contexto =
      this.contextoRepository.create({
        proyectoId,
        contenido:
          contextoCompleto,
      });

    return this.contextoRepository.save(
      contexto,
    );
  }

  async obtenerContexto(
    proyectoId: number,
  ) {
    const contexto =
      await this.contextoRepository.findOne({
        where: {
          proyectoId,
        },
        order: {
          id: 'DESC',
        },
      });

    if (!contexto) {
      throw new NotFoundException(
        'No existe contexto para este proyecto',
      );
    }

    return contexto;
  }
}