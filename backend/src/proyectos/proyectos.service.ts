import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Proyecto } from './proyecto.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Cliente } from '../clientes/cliente.entity';
import { UserStory, EstadoUS } from '../user-stories/user-story.entity';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectosRepository: Repository<Proyecto>,

    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,

    @InjectRepository(UserStory)
    private userStoriesRepository: Repository<UserStory>,
  ) {}

  // ================================
  // ✅ LISTAR
  // ================================
  async findAll(user: any) {
    const userRole =
      typeof user.rol === 'object' ? user.rol?.nombre : user.rol;

    if (userRole === 'superadmin') {
      return this.proyectosRepository.find({
        relations: ['usuarios', 'clientes'],
      });
    }

    return this.proyectosRepository
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.usuarios', 'usuario')
      .leftJoinAndSelect('proyecto.clientes', 'cliente')
      .where('usuario.id = :userId', { userId: user.sub })
      .andWhere('proyecto.activo = true')
      .getMany();
  }

  // ================================
  // ✅ OBTENER UNO
  // ================================
  async findOne(id: number, user: any) {
    const proyecto = await this.proyectosRepository.findOne({
      where: { id },
      relations: ['usuarios', 'clientes'],
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const userRole =
      typeof user.rol === 'object' ? user.rol?.nombre : user.rol;

    const pertenece = proyecto.usuarios.some(
      (u) => u.id === user.sub,
    );

    if (userRole !== 'superadmin' && !pertenece) {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }

    return proyecto;
  }

  // ================================
  // 🔥 PRD REAL (FIX ENUM)
  // ================================
  async getPrd(id: number, user: any) {
    const proyecto = await this.findOne(id, user);

    const userStories = await this.userStoriesRepository.find({
      where: {
        proyecto: { id },
        estado: EstadoUS.APROBADA, // 🔥 FIX IMPORTANTE
      },
    });

    const totalEstimacion = userStories.reduce(
      (acc, us) => acc + (us.estimacion || 0),
      0,
    );

    return {
      proyecto: {
        id: proyecto.id,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        estado: proyecto.estado,
      },

      clientes: proyecto.clientes.map((c) => ({
        id: c.id,
        razon_social: c.razon_social, // 🔥 FIX (antes usabas nombre)
        cuit: c.cuit,
      })),

      userStories: userStories.map((us) => ({
        id: us.id,
        titulo: us.titulo,
        descripcion: us.descripcion,
        estimacion: us.estimacion,
        prioridad: us.prioridad,
      })),

      estimacion_total: totalEstimacion,
      cantidad_historias: userStories.length,
    };
  }

  // ================================
  // ✅ CREATE
  // ================================
  async create(data: any, user: any) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id: user.sub },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const nuevoProyecto = this.proyectosRepository.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      usuarios: [usuario],
      estado: 'backlog',
      activo: true,
      estimacion_tiempo: 0,
      total_puntos_historia: 0,
    });

    return await this.proyectosRepository.save(nuevoProyecto);
  }

  // ================================
  // ✅ UPDATE
  // ================================
  async update(id: number, data: any, user: any) {
    const proyecto = await this.findOne(id, user);
    Object.assign(proyecto, data);
    return this.proyectosRepository.save(proyecto);
  }

  // ================================
  // ✅ DELETE (SOFT)
  // ================================
  async remove(id: number, user: any) {
    const proyecto = await this.findOne(id, user);
    proyecto.activo = false;
    return this.proyectosRepository.save(proyecto);
  }

  // ================================
  // ✅ RESTORE
  // ================================
  async restore(id: number, user: any) {
    const proyecto = await this.proyectosRepository.findOne({
      where: { id },
      relations: ['usuarios'],
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const userRole =
      typeof user.rol === 'object' ? user.rol?.nombre : user.rol;

    const pertenece = proyecto.usuarios.some(
      (u) => u.id === user.sub,
    );

    if (userRole !== 'superadmin' && !pertenece) {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }

    proyecto.activo = true;

    return this.proyectosRepository.save(proyecto);
  }

  // ================================
  // ✅ ASIGNAR USUARIOS
  // ================================
  async asignarUsuarios(proyectoId: number, usuariosIds: number[]) {
    const proyecto = await this.proyectosRepository.findOne({
      where: { id: proyectoId },
      relations: ['usuarios'],
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const usuarios = await this.usuariosRepository.find({
      where: { id: In(usuariosIds) },
    });

    proyecto.usuarios = usuarios;

    return this.proyectosRepository.save(proyecto);
  }

  // ================================
  // ✅ ASIGNAR CLIENTES
  // ================================
  async asignarClientes(proyectoId: number, clientesIds: number[]) {
    const proyecto = await this.proyectosRepository.findOne({
      where: { id: proyectoId },
      relations: ['clientes'],
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const clientes = await this.clientesRepository.find({
      where: { id: In(clientesIds) },
    });

    proyecto.clientes = clientes;

    return this.proyectosRepository.save(proyecto);
  }

  // ================================
  // ✅ RESUMEN
  // ================================
  async getResumen(id: number, user: any) {
    const proyecto = await this.findOne(id, user);

    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      estado: proyecto.estado,
      total_puntos: proyecto.total_puntos_historia,
      estimacion_tiempo: proyecto.estimacion_tiempo,
      usuarios: proyecto.usuarios?.length || 0,
      clientes: proyecto.clientes?.length || 0,
    };
  }
}