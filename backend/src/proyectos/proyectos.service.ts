import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Proyecto } from './proyecto.entity';
import { CreateProyectoDto } from './dto/create-proyecto.dto';

import { Usuario } from '../usuarios/usuario.entity';
import { Cliente } from '../clientes/cliente.entity';

import { GeminiService } from '../ia/services/gemini.service';
import { ContextosService } from '../contextos/contextos.service';
import { PrdService } from '../prd/prd.service';
import { CreatePrdDto } from '../prd/dto/create-prd.dto';
import { Prd } from '../prd/prd.entity';
import { UserStory, EstadoUS } from '../user-stories/user-story.entity';
import { UserStoriesService } from '../user-stories/user-stories.service';

export type AuthenticatedUser = {
  sub: number;
  rol: { nombre: string } | string;
};

type RoadmapDashboard = {
  totalHistorias: number;
  puntosTotales: number;
  porEstado: Record<string, { count: number; puntos: number }>;
};

type RoadmapDependencia = {
  id: number;
  titulo: string;
  dependencias: number[];
};

type RoadmapHistoriaResumen = {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: number;
  estimacion: number;
  estado: EstadoUS;
};

type RoadmapHistoriaCanonica = RoadmapHistoriaResumen & {
  estimacionValidada: boolean;
  dependencias: Array<{
    id: number;
    titulo: string;
  }>;
};

type RoadmapHistoriaGroups = {
  historiasCanonicas: UserStory[];
  backlog: UserStory[];
  aprobadas: UserStory[];
  pendientes: UserStory[];
  totalHistorias: number;
  totalPuntos: number;
  dependencias: RoadmapDependencia[];
};

type GeminiPrdResponse = {
  titulo?: string;
  descripcion?: string;
  resumenEjecutivo?: string;
  version?: string;
};

type RoadmapSprint = {
  sprint: string;
  historias: Array<{
    id: number;
    titulo: string;
    estimacion: number;
  }>;
  totalEstimacion: number;
};

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectosRepository: Repository<Proyecto>,

    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,

    private readonly geminiService: GeminiService,

    private readonly contextosService: ContextosService,

    private readonly prdService: PrdService,

    private readonly userStoriesService: UserStoriesService,
  ) {}

  private readonly SPRINT_CAPACITY = 8;

  async findAll(user: AuthenticatedUser) {
    const userRole =
      typeof user.rol === 'object'
        ? user.rol?.nombre
        : user.rol;

    if (userRole === 'superadmin') {
      return this.proyectosRepository.find({
        withDeleted: false,
        relations: ['usuarios', 'clientes'],
        order: {
          activo: 'DESC',
          fecha_creacion: 'DESC',
        },
      });
    }

    return this.proyectosRepository.find({
      where: {
        activo: true,
        usuarios: {
          id: user.sub,
        },
      },
      relations: ['usuarios', 'clientes'],
      order: {
        fecha_creacion: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
    user: AuthenticatedUser,
  ) {
    const proyecto =
      await this.proyectosRepository.findOne({
        where: { id },

        withDeleted: true,

        relations: [
          'usuarios',
          'clientes',
        ],
      });

    if (!proyecto) {
      throw new NotFoundException(
        'Proyecto no encontrado',
      );
    }

    const userRole =
      typeof user.rol === 'object'
        ? user.rol?.nombre
        : user.rol;

    const pertenece =
      proyecto.usuarios?.some(
        (u) => u.id === user.sub,
      );

    if (
      userRole !== 'superadmin' &&
      !pertenece
    ) {
      throw new ForbiddenException(
        'No tenés acceso a este proyecto',
      );
    }

    return proyecto;
  }

  async create(
    dto: CreateProyectoDto,
    user: AuthenticatedUser,
  ) {
    const usuarioLogueado =
      await this.usuariosRepository.findOne({
        where: {
          id: user.sub,
        },
      });

    const proyecto =
      this.proyectosRepository.create({
        ...dto,
        activo: true,
        estado: 'activo',
        usuarios: usuarioLogueado
          ? [usuarioLogueado]
          : [],
      });

    return this.proyectosRepository.save(
      proyecto,
    );
  }

  async update(
    id: number,
    dto: CreateProyectoDto,
    user: AuthenticatedUser,
  ) {
    const proyecto =
      await this.findOne(
        id,
        user,
      );

    Object.assign(
      proyecto,
      dto,
    );

    return this.proyectosRepository.save(
      proyecto,
    );
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ) {
    const proyecto =
      await this.findOne(
        id,
        user,
      );

    proyecto.activo = false;
    proyecto.estado = 'inactivo';

    await this.proyectosRepository.save(
      proyecto,
    );

    await this.proyectosRepository.softDelete(
      id,
    );

    return {
      message:
        'Proyecto desactivado correctamente',
    };
  }

  async restore(
    id: number,
    user: AuthenticatedUser,
  ) {
    const proyecto =
      await this.proyectosRepository.findOne({
        where: { id },
        withDeleted: true,
        relations: ['usuarios'],
      });

    if (!proyecto) {
      throw new NotFoundException(
        'Proyecto no encontrado',
      );
    }

    await this.proyectosRepository.update(
      id,
      {
        deletedAt: null,
        activo: true,
        estado: 'activo',
      },
    );

    const yaEstaAsignado =
      proyecto.usuarios?.some(
        (u) => u.id === user.sub,
      );

    if (!yaEstaAsignado) {
      const usuario =
        await this.usuariosRepository.findOne({
          where: {
            id: user.sub,
          },
        });

      if (usuario) {
        proyecto.usuarios = [
          ...(proyecto.usuarios || []),
          usuario,
        ];

        await this.proyectosRepository.save(
          proyecto,
        );
      }
    }

    return {
      message:
        'Proyecto reactivado correctamente',
    };
  }

  async asignarUsuarios(
    proyectoId: number,
    usuariosIds: number[],
  ) {
    const proyecto =
      await this.proyectosRepository.findOne({
        where: {
          id: proyectoId,
        },
        relations: ['usuarios'],
      });

    if (!proyecto) {
      throw new NotFoundException(
        'Proyecto no encontrado',
      );
    }

    const usuarios =
      await this.usuariosRepository.findByIds(
        usuariosIds,
      );

    proyecto.usuarios = usuarios;

    return this.proyectosRepository.save(
      proyecto,
    );
  }

  async asignarClientes(
    proyectoId: number,
    clientesIds: number[],
  ) {
    const proyecto =
      await this.proyectosRepository.findOne({
        where: {
          id: proyectoId,
        },
        relations: ['clientes'],
      });

    if (!proyecto) {
      throw new NotFoundException(
        'Proyecto no encontrado',
      );
    }

    const clientes =
      await this.clientesRepository.findByIds(
        clientesIds,
      );

    proyecto.clientes = clientes;

    return this.proyectosRepository.save(
      proyecto,
    );
  }

  async getResumen(
    id: number,
    user: AuthenticatedUser,
  ) {
    const proyecto =
      await this.findOne(
        id,
        user,
      );

    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      descripcion:
        proyecto.descripcion,
      estado: proyecto.estado,
      activo: proyecto.activo,
      usuarios:
        proyecto.usuarios?.length || 0,
      clientes:
        proyecto.clientes?.length || 0,
    };
  }

  async getRoadmap(
    id: number,
    user: AuthenticatedUser,
  ) {
    const proyecto =
      await this.findOne(
        id,
        user,
      );

    let prd: Prd | null = null;

    try {
      prd = await this.prdService.findByProyectoId(
        id,
      );
    } catch (error) {
      if (!(
        error instanceof NotFoundException
      )) {
        throw error;
      }
    }

    const historias =
      await this.userStoriesService.findByProyecto(
        id,
      );

    const dashboard =
      this.calcularDashboard(
        historias,
      );

    const {
      historiasCanonicas,
      backlog,
      aprobadas,
      pendientes,
      totalHistorias,
      totalPuntos,
      dependencias,
    } = this.agruparHistorias(
      historias,
    );

    const sprints =
      this.generarSprints(
        historias,
      );

    const riesgos =
      this.generarRiesgos(
        prd,
        historiasCanonicas,
        pendientes,
        historias,
      );

    const proximosPasos = [
      'Revisar el PRD y validar que refleje correctamente el alcance.',
      'Confirmar las historias canónicas con el equipo.',
      'Validar las estimaciones pendientes.',
      'Avanzar con los Sprints propuestos en función de prioridad y estimación.',
    ];

    return {
      proyecto: {
        id: proyecto.id,
        nombre: proyecto.nombre,
        descripcion:
          proyecto.descripcion,
        estado: proyecto.estado,
        estadoFlujo:
          proyecto.estadoFlujo,
        estimacion_tiempo:
          proyecto.estimacion_tiempo,
        total_puntos_historia:
          proyecto.total_puntos_historia,
      },
      prd: prd
        ? {
            id: prd.id,
            titulo: prd.titulo,
            descripcion: prd.descripcion,
            version: prd.version,
          }
        : null,
      dashboard,
      historiasCanonicas: historiasCanonicas.map(
        (h) => this.mapHistoriaCanonica(h),
      ),
      backlog: backlog.map((h) =>
        this.mapHistoriaResumen(h),
      ),
      historiasAprobadas: aprobadas.map(
        (h) => this.mapHistoriaResumen(h),
      ),
      historiasPendientes: pendientes.map(
        (h) => this.mapHistoriaResumen(h),
      ),
      totalHistorias,
      totalPuntos,
      estimacionTotal: totalPuntos,
      dependencias,
      sprints,
      riesgos,
      proximosPasos,
    };
  }

  private calcularDashboard(
    historias: UserStory[],
  ): RoadmapDashboard {
    return historias.reduce<RoadmapDashboard>(
      (acc, historia) => {
        acc.totalHistorias += 1;
        acc.puntosTotales += historia.estimacion || 0;

        if (!acc.porEstado[historia.estado]) {
          acc.porEstado[historia.estado] = {
            count: 0,
            puntos: 0,
          };
        }

        acc.porEstado[historia.estado].count += 1;
        acc.porEstado[historia.estado].puntos +=
          historia.estimacion || 0;

        return acc;
      },
      {
        totalHistorias: 0,
        puntosTotales: 0,
        porEstado: {},
      },
    );
  }

  private agruparHistorias(
    historias: UserStory[],
  ): RoadmapHistoriaGroups {
    const result: RoadmapHistoriaGroups = {
      historiasCanonicas: [],
      backlog: [],
      aprobadas: [],
      pendientes: [],
      totalHistorias: 0,
      totalPuntos: 0,
      dependencias: [],
    };

    for (const historia of historias) {
      result.totalHistorias += 1;
      result.totalPuntos += historia.estimacion || 0;

      if (historia.esCanonica) {
        result.historiasCanonicas.push(historia);
      }

if (historia.estado === EstadoUS.BACKLOG) {
      result.backlog.push(historia);
    }

    if (historia.estado === EstadoUS.APROBADA) {
      result.aprobadas.push(historia);
    }

    if (historia.estado !== EstadoUS.DONE) {
        result.pendientes.push(historia);
      }

      result.dependencias.push({
        id: historia.id,
        titulo: historia.titulo,
        dependencias:
          historia.dependencias?.map(
            (d) => d.id,
          ) || [],
      });
    }

    return result;
  }

  private generarSprints(
    historias: UserStory[],
  ): RoadmapSprint[] {
    const backlogOrdenado = [...historias].sort(
      (a, b) =>
        (b.prioridad || 0) -
          (a.prioridad || 0) ||
        (b.estimacion || 0) -
          (a.estimacion || 0),
    );

    const sprints: Array<{
      sprint: string;
      historias: Array<{
        id: number;
        titulo: string;
        estimacion: number;
      }>;
      totalEstimacion: number;
    }> = [];

    let currentSprint = 1;
    let currentCapacity = 0;
    let currentBatch: Array<{
      id: number;
      titulo: string;
      estimacion: number;
    }> = [];

    for (const historia of backlogOrdenado) {
      const estimate = historia.estimacion || 0;

      if (
        currentCapacity + estimate >
          this.SPRINT_CAPACITY &&
        currentBatch.length > 0
      ) {
        sprints.push({
          sprint: `Sprint ${currentSprint}`,
          historias: currentBatch,
          totalEstimacion:
            currentCapacity,
        });

        currentSprint += 1;
        currentBatch = [];
        currentCapacity = 0;
      }

      currentBatch.push({
        id: historia.id,
        titulo: historia.titulo,
        estimacion: estimate,
      });
      currentCapacity += estimate;
    }

    if (currentBatch.length > 0) {
      sprints.push({
        sprint: `Sprint ${currentSprint}`,
        historias: currentBatch,
        totalEstimacion:
          currentCapacity,
      });
    }

    return sprints;
  }

  private generarRiesgos(
    prd: Prd | null,
    historiasCanonicas: UserStory[],
    pendientes: UserStory[],
    historias: UserStory[],
  ): string[] {
    const riesgos: string[] = [];

    if (!prd) {
      riesgos.push(
        'No existe un PRD generado para este proyecto.',
      );
    }

    if (historiasCanonicas.length === 0) {
      riesgos.push(
        'No hay historias marcadas como canónicas.',
      );
    }

    if (pendientes.length > 0) {
      riesgos.push(
        'Hay historias pendientes sin completar.',
      );
    }

    if (historias.some(
      (h) => !h.estimacionValidada,
    )) {
      riesgos.push(
        'Existen estimaciones sin validar.',
      );
    }

    return riesgos;
  }

  private mapHistoriaResumen(
    historia: UserStory,
  ): RoadmapHistoriaResumen {
    return {
      id: historia.id,
      titulo: historia.titulo,
      descripcion: historia.descripcion,
      prioridad: historia.prioridad,
      estimacion: historia.estimacion,
      estado: historia.estado,
    };
  }

  private normalizeGeminiPrdResponse(
    candidate: unknown,
  ): GeminiPrdResponse {
    if (
      candidate &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate)
    ) {
      const normalized = candidate as Record<string, unknown>;

      return {
        titulo:
          typeof normalized.titulo === 'string'
            ? normalized.titulo
            : undefined,
        descripcion:
          typeof normalized.descripcion === 'string'
            ? normalized.descripcion
            : undefined,
        resumenEjecutivo:
          typeof normalized.resumenEjecutivo === 'string'
            ? normalized.resumenEjecutivo
            : undefined,
        version:
          typeof normalized.version === 'string'
            ? normalized.version
            : undefined,
      };
    }

    return {};
  }

  private mapHistoriaCanonica(
    historia: UserStory,
  ): RoadmapHistoriaCanonica {
    return {
      id: historia.id,
      titulo: historia.titulo,
      descripcion: historia.descripcion,
      prioridad: historia.prioridad,
      estimacion: historia.estimacion,
      estado: historia.estado,
      estimacionValidada:
        historia.estimacionValidada,
      dependencias:
        historia.dependencias?.map(
          (d) => ({
            id: d.id,
            titulo: d.titulo,
          }),
        ) || [],
    };
  }

  async getPrd(
    id: number,
    user: AuthenticatedUser,
  ) {
    const proyecto =
      await this.findOne(
        id,
        user,
      );

    let prd: Prd | null = null;

    try {
      prd = await this.prdService.findByProyectoId(
        id,
      );
    } catch (error) {
      if (!(
        error instanceof NotFoundException
      )) {
        throw error;
      }

      const contexto =
        await this.contextosService.procesarProyecto(
          id,
        );

      const contextoArray = [
        {
          nombreArchivo: `contexto_proyecto_${id}.txt`,
          tipo: 'contexto',
          contenido: contexto.contenido || '',
        },
      ];

      const prdResultUnvalidated: unknown =
        await this.geminiService.generarPrd(
          proyecto,
          contextoArray,
        );

      const prdResult =
        this.normalizeGeminiPrdResponse(
          prdResultUnvalidated,
        );

      const createPrdDto: CreatePrdDto = {
        titulo:
          prdResult.titulo ||
          proyecto.nombre,
        descripcion:
          prdResult.resumenEjecutivo ||
          prdResult.descripcion ||
          proyecto.descripcion ||
          '',
        version: prdResult.version || '1.0.0',
        proyecto_id: id,
        user_stories_ids: [],
      };

      prd = await this.prdService.create(
        createPrdDto,
      );
    }

    const historias =
      await this.userStoriesService.findByProyecto(
        id,
      );

    if (
      !historias ||
      historias.length === 0
    ) {
      await this.userStoriesService.generarHistoriasDesdePrd(
        id,
      );
    }

    return prd;
  }

  async findInactivos(user: any) {
    return this.proyectosRepository.find({
      where: {
        activo: false,
      },
      withDeleted: true,
      relations: ['usuarios'],
    });
  }
}