import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserStory, EstadoUS } from './user-story.entity';

import { CreateUserStoryDto } from './dto/create-user-story.dto';

import { Proyecto } from '../proyectos/proyecto.entity';

@Injectable()
export class UserStoriesService {
  constructor(
    @InjectRepository(UserStory)
    private readonly userStoryRepository: Repository<UserStory>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
  ) {}

  // ======================================================
  // CREAR USER STORY
  // ======================================================

  async create(
    dto: CreateUserStoryDto,
  ): Promise<UserStory> {
    const proyecto =
      await this.proyectoRepository.findOne({
        where: {
          id: dto.proyectoId,
        },
      });

    if (!proyecto) {
      throw new NotFoundException(
        'Proyecto no encontrado',
      );
    }

    const nuevaHistoria =
      this.userStoryRepository.create({
        titulo: dto.titulo,

        descripcion: dto.descripcion,

        prioridad:
          dto.prioridad || 1,

        estimacion:
          dto.estimacion || 0,

        estado:
          (dto.estado as EstadoUS) ||
          EstadoUS.BACKLOG,

        proyecto,

        source:
          dto.source || 'manual',

        confianza_US:
          dto.confianza_US || 0,

        confianza_Estimacion:
          dto.confianza_Estimacion ||
          0,
      });

    return await this.userStoryRepository.save(
      nuevaHistoria,
    );
  }

  // ======================================================
  // OBTENER HISTORIAS POR PROYECTO
  // ======================================================

  async findByProyecto(
    proyectoId: number,
  ): Promise<UserStory[]> {
    return await this.userStoryRepository.find({
      where: {
        proyecto: {
          id: proyectoId,
        },
      },

      relations: ['proyecto'],

      order: {
        id: 'DESC',
      },
    });
  }

  // ======================================================
  // OBTENER UNA HISTORIA
  // ======================================================

  async findOne(
    id: number,
  ): Promise<UserStory> {
    const historia =
      await this.userStoryRepository.findOne({
        where: { id },

        relations: ['proyecto'],
      });

    if (!historia) {
      throw new NotFoundException(
        'User Story no encontrada',
      );
    }

    return historia;
  }

  // ======================================================
  // ACTUALIZAR
  // ======================================================

  async update(
    id: number,
    data: Partial<UserStory>,
  ): Promise<UserStory> {
    const historia =
      await this.findOne(id);

    // ==========================================
    // VALIDAR TRANSICIONES
    // ==========================================

    if (
      data.estado &&
      data.estado !== historia.estado
    ) {
      const transicionesValidas =
        this.obtenerTransicionesValidas(
          historia.estado,
        );

      if (
        !transicionesValidas.includes(
          data.estado,
        )
      ) {
        throw new BadRequestException(
          `Transición inválida: ${historia.estado} → ${data.estado}`,
        );
      }
    }

    Object.assign(historia, data);

    return await this.userStoryRepository.save(
      historia,
    );
  }

  // ======================================================
  // ELIMINAR
  // ======================================================

  async remove(
    id: number,
  ): Promise<void> {
    const historia =
      await this.findOne(id);

    await this.userStoryRepository.remove(
      historia,
    );
  }

  // ======================================================
  // TRANSICIONES VÁLIDAS
  // ======================================================

  private obtenerTransicionesValidas(
    estado: EstadoUS,
  ): EstadoUS[] {
    switch (estado) {
      case EstadoUS.BACKLOG:
        return [EstadoUS.EN_PROGRESO];

      case EstadoUS.EN_PROGRESO:
        return [EstadoUS.APROBADA];

      case EstadoUS.APROBADA:
        return [];

      default:
        return [];
    }
  }
}