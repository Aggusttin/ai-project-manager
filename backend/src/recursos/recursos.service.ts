import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { promises as fs } from 'fs';
import * as path from 'path';

// IMPORT CORREGIDO
const pdf = require('pdf-parse');

import * as mammoth from 'mammoth';

import { Recurso } from './recurso.entity';

import { CreateRecursoDto } from './dto/create-recurso.dto';

@Injectable()
export class RecursosService {
  constructor(
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
  ) {}

  async create(
    createRecursoDto: CreateRecursoDto,
    user: any,
  ): Promise<Recurso> {
    try {
      const recurso =
        this.recursoRepository.create({
          nombre:
            createRecursoDto.nombre,

          url_path:
            createRecursoDto.url_path,

          tipo:
            createRecursoDto.tipo,

          proyecto_id:
            createRecursoDto.proyecto_id,

          user_id:
            user.sub || user.id,

          metadata:
            createRecursoDto.metadata || {},
        });

      return await this.recursoRepository.save(
        recurso,
      );
    } catch (error: any) {
      console.error(error);

      throw new InternalServerErrorException({
        message:
          'Error al guardar recurso',
        detail:
          error?.message,
      });
    }
  }

  async createFromUpload(
    file: Express.Multer.File,
    proyectoId: number,
    user: any,
  ) {
    try {
      const extension =
        file.originalname
          .split('.')
          .pop()
          ?.toLowerCase();

      let tipo = 'documento';

      if (
        [
          'mp3',
          'wav',
          'm4a',
          'ogg',
        ].includes(extension || '')
      ) {
        tipo = 'audio';
      }

      const recurso =
        this.recursoRepository.create({
          nombre:
            file.originalname,

          url_path:
            `/uploads/${file.filename}`,

          tipo,

          proyecto_id:
            proyectoId,

          user_id:
            user.sub || user.id,

          metadata: {
            size: file.size,
            mimetype:
              file.mimetype,
          },
        });

      return await this.recursoRepository.save(
        recurso,
      );
    } catch (error: any) {
      console.error(error);

      throw new InternalServerErrorException({
        message:
          'Error al guardar archivo',
        detail:
          error?.message,
      });
    }
  }

  async findAllByProyecto(
    proyecto_id: number,
  ): Promise<Recurso[]> {
    return this.recursoRepository.find({
      where: {
        proyecto_id,
      },

      order: {
        fecha_creacion:
          'DESC',
      },
    });
  }

  async getContenidoParaIA(
    recursoId: number,
  ): Promise<{
    tipo: string;
    contenido: string;
    nombreArchivo: string;
  }> {
    const recurso =
      await this.recursoRepository.findOne({
        where: { id: recursoId },
      });

    if (!recurso) {
      throw new NotFoundException(
        `Recurso con ID ${recursoId} no encontrado.`,
      );
    }

    const filePath = path.join(
      process.cwd(),
      recurso.url_path,
    );

    const extension =
      path.extname(
        recurso.nombre,
      ).toLowerCase();

    let contenido = '';

    try {
      switch (extension) {
        case '.txt':
          contenido =
            await fs.readFile(
              filePath,
              'utf-8',
            );
          break;

        case '.pdf':
          const dataBuffer =
            await fs.readFile(
              filePath,
            );

          const data =
            await pdf(
              dataBuffer,
            );

          contenido =
            data.text || '';
          break;

        case '.docx':
          const { value } =
            await mammoth.extractRawText({
              path: filePath,
            });

          contenido = value;
          break;

        case '.mp3':
        case '.wav':
        case '.m4a':
        case '.ogg':
          contenido =
            `[Transcripción pendiente para ${recurso.nombre}]`;
          break;

        default:
          throw new BadRequestException(
            `Tipo de archivo no soportado para extracción de contenido: ${extension}`,
          );
      }

      return {
        tipo: recurso.tipo,
        contenido:
          contenido.trim(),
        nombreArchivo:
          recurso.nombre,
      };
    } catch (error: any) {
      console.error(error);

      if (
        error?.code ===
        'ENOENT'
      ) {
        throw new NotFoundException(
          `El archivo físico para el recurso ${recursoId} no fue encontrado en el servidor.`,
        );
      }

      throw new InternalServerErrorException(
        `Error al leer o procesar el contenido del archivo: ${recurso.nombre}`,
      );
    }
  }
}