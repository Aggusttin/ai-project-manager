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
import { PrdService } from '../prd/prd.service';
import { GeminiService } from '../ia/services/gemini.service';

@Injectable()
export class UserStoriesService {
  constructor(
    @InjectRepository(UserStory)
    private readonly userStoryRepository: Repository<UserStory>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,

    private readonly prdService: PrdService,
    
    private readonly geminiService: GeminiService
  ) {}

  // ======================================================
  // CREAR USER STORY
  // ======================================================

  async create(dto: CreateUserStoryDto): Promise<UserStory> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { id: dto.proyectoId },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const nuevaHistoria = this.userStoryRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      prioridad: dto.prioridad || 1,
      estimacion: dto.estimacion || 0,
      estado: (dto.estado as EstadoUS) || EstadoUS.BACKLOG,
      proyecto,
      source: dto.source || 'manual',
      confianza_US: dto.confianza_US || 0,
      confianza_Estimacion: dto.confianza_Estimacion || 0,
    });

    return await this.userStoryRepository.save(nuevaHistoria);
  }

  // ======================================================
  // CAMBIAR ESTADO (NUEVO)
  // ======================================================

  async cambiarEstado(id: number, nuevoEstado: EstadoUS): Promise<UserStory> {
    const historia = await this.findOne(id);

    const transicionesValidas = this.obtenerTransicionesValidas(historia.estado);

    if (!transicionesValidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida: ${historia.estado} → ${nuevoEstado}`,
      );
    }

    historia.estado = nuevoEstado;
    return await this.userStoryRepository.save(historia);
  }

  // ======================================================
  // OBTENER HISTORIAS POR PROYECTO
  // ======================================================

  async findByProyecto(proyectoId: number): Promise<UserStory[]> {
    return await this.userStoryRepository.find({
      where: { proyecto: { id: proyectoId } },
      relations: ['proyecto'],
      order: { id: 'DESC' },
    });
  }

  // ======================================================
  // OBTENER UNA HISTORIA
  // ======================================================

  async findOne(id: number): Promise<UserStory> {
    const historia = await this.userStoryRepository.findOne({
      where: { id },
      relations: ['proyecto'],
    });

    if (!historia) {
      throw new NotFoundException('User Story no encontrada');
    }

    return historia;
  }

  // ======================================================
  // ACTUALIZAR (GENÉRICO)
  // ======================================================

  async update(id: number, data: Partial<UserStory>): Promise<UserStory> {
    const historia = await this.findOne(id);
    
    // Si se está actualizando el estado, usamos la validación del método nuevo
    if (data.estado && data.estado !== historia.estado) {
      return await this.cambiarEstado(id, data.estado);
    }

    Object.assign(historia, data);
    return await this.userStoryRepository.save(historia);
  }

  // ======================================================
  // ELIMINAR
  // ======================================================

  async remove(id: number): Promise<void> {
    const historia = await this.findOne(id);
    await this.userStoryRepository.remove(historia);
  }

  // ======================================================
  // TRANSICIONES VÁLIDAS
  // ======================================================

  private obtenerTransicionesValidas(estado: EstadoUS): EstadoUS[] {
    switch (estado) {
      case EstadoUS.BACKLOG:
        return [EstadoUS.EN_PROGRESO];
      case EstadoUS.EN_PROGRESO:
        return [EstadoUS.APROBADA];
      case EstadoUS.APROBADA:
        return [EstadoUS.DONE];
      case EstadoUS.DONE:
        return [];
      default:
        return [];
    }
  }

  async createManyFromIA(proyectoId: number, historias: any[]): Promise<UserStory[]> {
    if (!Array.isArray(historias)) {
      throw new BadRequestException('El formato enviado no es un array válido');
    }

    const proyecto = await this.proyectoRepository.findOne({ where: { id: proyectoId } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    // Mapeo con promesas para esperar la estimación de la IA
    const entidades = await Promise.all(historias.map(async (h) => {
      // Pedimos a la IA que estime esta historia basándose en su descripción
      const estimacion = await this.geminiService.estimarHistoria(h.descripcion);
      
      return this.userStoryRepository.create({
        titulo: h.titulo || 'Sin título',
        descripcion: h.descripcion || 'Sin descripción',
        prioridad: Number(h.prioridad) || 1,
        estimacion: estimacion, // <--- La magia de la Fase 5
        estado: EstadoUS.BACKLOG,
        proyecto: proyecto,
        source: 'IA',
      });
    }));

    return await this.userStoryRepository.save(entidades);
  }

  async generarHistoriasDesdePrd(proyectoId: number): Promise<UserStory[]> {
    const prd = await this.prdService.findByProyectoId(proyectoId);
    const historiasGeneradas = await this.geminiService.generarUserStories({ 
      nombre: prd.titulo, 
      descripcion: prd.descripcion
    });

    return await this.createManyFromIA(proyectoId, historiasGeneradas);
  }

  async obtenerDashboard(proyectoId: number) {
    const historias = await this.userStoryRepository.find({
      where: { proyecto: { id: proyectoId } }
    });

    const resumen = historias.reduce((acc, h) => {
      acc.totalHistorias += 1;
      acc.puntosTotales += h.estimacion || 0;
      
      if (!acc.porEstado[h.estado]) acc.porEstado[h.estado] = { count: 0, puntos: 0 };
      acc.porEstado[h.estado].count += 1;
      acc.porEstado[h.estado].puntos += h.estimacion || 0;
      
      return acc;
    }, { totalHistorias: 0, puntosTotales: 0, porEstado: {} });

    return resumen;
  }
}