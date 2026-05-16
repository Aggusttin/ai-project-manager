import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserStory, EstadoUS } from './user-story.entity';
import { Proyecto } from '../proyectos/proyecto.entity';

@Injectable()
export class UserStoriesService {
  constructor(
    @InjectRepository(UserStory)
    private usRepository: Repository<UserStory>,

    @InjectRepository(Proyecto)
    private proyectosRepository: Repository<Proyecto>,
  ) {}

  // ================================
  // ✅ CREAR
  // ================================
  async create(data: any) {
    const proyecto = await this.proyectosRepository.findOne({
      where: { id: data.proyectoId },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const nuevaUS = this.usRepository.create({
      titulo: data.titulo,
      descripcion: data.descripcion,
      estimacion: data.estimacion || 0,
      prioridad: data.prioridad || 1,
      estado: EstadoUS.BACKLOG,
      proyecto,
    });

    return this.usRepository.save(nuevaUS);
  }

  // ================================
  // ✅ LISTAR
  // ================================
  async findAllByProyecto(proyectoId: number) {
    return this.usRepository.find({
      where: {
        proyecto: { id: proyectoId },
      },
    });
  }

  // ================================
  // 🔥 VALIDAR TRANSICIONES (FIX TIPADO)
  // ================================
  private validarTransicion(actual: EstadoUS, nuevo: EstadoUS) {
    const reglas: Record<EstadoUS, EstadoUS[]> = {
      [EstadoUS.BACKLOG]: [EstadoUS.EN_PROGRESO],
      [EstadoUS.EN_PROGRESO]: [EstadoUS.APROBADA],
      [EstadoUS.APROBADA]: [EstadoUS.DONE],
      [EstadoUS.DONE]: [],
    };

    if (!reglas[actual].includes(nuevo)) {
      throw new BadRequestException(
        `Transición inválida: ${actual} → ${nuevo}`,
      );
    }
  }

  // ================================
  // 🔥 UPDATE CORRECTO (CONVERSIÓN DTO → ENUM)
  // ================================
  async update(id: number, data: any) {
    const us = await this.usRepository.findOne({
      where: { id },
    });

    if (!us) {
      throw new NotFoundException('User Story no encontrada');
    }

    // 🔥 BLOQUEAR DONE
    if (us.estado === EstadoUS.DONE) {
      throw new BadRequestException(
        'No se puede modificar una US finalizada',
      );
    }

    // 🔥 CONVERTIR STRING → ENUM
    if (data.estado) {
      const nuevoEstado = data.estado as EstadoUS;

      if (!Object.values(EstadoUS).includes(nuevoEstado)) {
        throw new BadRequestException('Estado inválido');
      }

      this.validarTransicion(us.estado, nuevoEstado);
      us.estado = nuevoEstado;
    }

    // 🔥 OTROS CAMPOS
    if (data.titulo !== undefined) us.titulo = data.titulo;
    if (data.descripcion !== undefined) us.descripcion = data.descripcion;
    if (data.estimacion !== undefined) us.estimacion = data.estimacion;
    if (data.prioridad !== undefined) us.prioridad = data.prioridad;

    return this.usRepository.save(us);
  }
}