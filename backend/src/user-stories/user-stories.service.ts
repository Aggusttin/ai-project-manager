import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStory, EstadoUS } from './user-story.entity';
import { CreateUserStoryDto } from './dto/create-user-story.dto';
import { Proyecto, EstadoFlujo } from '../proyectos/proyecto.entity'; // Asegúrate de importar EstadoFlujo
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
  // NUEVO: LÓGICA DE VALIDACIÓN HUMANA (1ra Validacion)
  // ======================================================
  async confirmarHistoria(id: number, data: { esCanonica: boolean; comentario?: string }) {
    const historia = await this.findOne(id);

    historia.esCanonica = data.esCanonica;
    historia.comentarioValidacion = data.comentario || '';
    await this.userStoryRepository.save(historia);

    // Verificamos si ya no quedan historias sin validar para este proyecto
    const pendientes = await this.userStoryRepository.count({
      where: { proyecto: { id: historia.proyecto.id }, esCanonica: false }
    });

    // Si todas fueron validadas, avanzamos el estado del proyecto
    if (pendientes === 0) {
      await this.proyectoRepository.update(historia.proyecto.id, { 
        estadoFlujo: EstadoFlujo.HISTORIAS_CANONICAS 
      });
    }

    return historia;
  }

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
      esCanonica: false, // Inicializamos como no canónica
    });

    return await this.userStoryRepository.save(nuevaHistoria);
  }

  // ======================================================
  // CAMBIAR ESTADO
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

  // ======================================================
  // GENERACIÓN POR IA
  // ======================================================

  async createManyFromIA(proyectoId: number, historias: any[]): Promise<UserStory[]> {
    if (!Array.isArray(historias)) {
      throw new BadRequestException('El formato enviado no es un array válido');
    }

    const proyecto = await this.proyectoRepository.findOne({ where: { id: proyectoId } });
    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    const entidades = await Promise.all(historias.map(async (h) => {
      const estimacion = await this.geminiService.estimarHistoria(h.descripcion);
      
      return this.userStoryRepository.create({
        titulo: h.titulo || 'Sin título',
        descripcion: h.descripcion || 'Sin descripción',
        prioridad: Number(h.prioridad) || 1,
        estimacion: estimacion,
        estado: EstadoUS.BACKLOG,
        proyecto: proyecto,
        source: 'IA',
        esCanonica: false, // Marcamos como no canónica hasta que el humano valide
      });
    }));

    // Actualizamos el estado del proyecto al terminar la generación automática
    await this.proyectoRepository.update(proyectoId, { estadoFlujo: EstadoFlujo.ESPERANDO_VALIDACION_HISTORIAS });

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

  // ======================================================
  // DASHBOARD
  // ======================================================

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

  // ======================================================
  // ESTIMACIÓN AUTOMÁTICA (Fase 4)
  // ======================================================

  async estimarHistoriasCanonicas(proyectoId: number): Promise<UserStory[]> {
    const proyecto = await this.proyectoRepository.findOne({ where: { id: proyectoId } });
    
    // 1. Verificación de seguridad: Solo estimar si las historias son canónicas
    if (proyecto.estadoFlujo !== EstadoFlujo.HISTORIAS_CANONICAS) {
      throw new BadRequestException('El proyecto no está en estado HISTORIAS_CANONICAS');
    }

    // 2. Buscar todas las historias canonicas del proyecto
    const historias = await this.userStoryRepository.find({
      where: { proyecto: { id: proyectoId }, esCanonica: true }
    });

    // 3. Estimación mediante IA
    const historiasEstimadas = await Promise.all(historias.map(async (h) => {
      h.estimacion = await this.geminiService.estimarHistoria(h.descripcion);
      h.confianza_Estimacion = 0.8; // Valor de ejemplo
      return h;
    }));

    // 4. Guardar cambios y actualizar estado del flujo
    await this.userStoryRepository.save(historiasEstimadas);
    await this.proyectoRepository.update(proyectoId, { 
      estadoFlujo: EstadoFlujo.ESPERANDO_VALIDACION_ESTIMACIONES 
    });

    return historiasEstimadas;
  }

  async confirmarEstimacion(
    id: number, 
    data: { estimacionConfirmada: number; comentario?: string }
  ) {
    // 1. Buscamos la historia incluyendo la relación con el proyecto
    const historia = await this.userStoryRepository.findOne({ 
      where: { id }, 
      relations: ['proyecto'] 
    });
    
    if (!historia) {
      throw new NotFoundException(`Historia con ID ${id} no encontrada`);
    }

    // 2. Actualizamos con los datos validados
    historia.estimacion = data.estimacionConfirmada;
    historia.estimacionValidada = true;
    
    // Si enviaste un comentario, lo guardamos (opcional según tu lógica)
    if (data.comentario) {
      historia.comentarioValidacion = data.comentario;
    }

    await this.userStoryRepository.save(historia);

    // 3. Verificamos si faltan estimaciones por validar en el proyecto
    const pendientes = await this.userStoryRepository.count({
      where: { 
        proyecto: { id: historia.proyecto.id }, 
        estimacionValidada: false 
      }
    });

    // 4. Si ya no quedan pendientes, el proyecto queda APTO/FINALIZADO
    if (pendientes === 0) {
      await this.proyectoRepository.update(historia.proyecto.id, { 
        estadoFlujo: EstadoFlujo.APROBADO_FINAL 
      });
    }

    return historia;
  }
}