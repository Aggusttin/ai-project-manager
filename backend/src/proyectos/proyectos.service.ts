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

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectosRepository: Repository<Proyecto>,

    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    
  ) {}

  // =========================================
  // LISTAR
  // =========================================

  async findAll(user: any) {
    const userRole = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;

    if (userRole === 'superadmin') {
      return this.proyectosRepository.find({
        withDeleted: false, // Solo activos
        relations: ['usuarios', 'clientes'],
        order: { activo: 'DESC', fecha_creacion: 'DESC' },
      });
    }

    // --- SOLUCIÓN: Usar find en lugar de QueryBuilder para evitar errores de JOIN ---
    // Esto es mucho más seguro para evitar que la relación de usuario falle
    return await this.proyectosRepository.find({
      where: {
        activo: true,
        usuarios: { id: user.sub } // TypeORM maneja el JOIN automáticamente
      },
      relations: ['usuarios', 'clientes'],
      order: { fecha_creacion: 'DESC' }
    });
  }

  // =========================================
  // OBTENER UNO
  // =========================================

  async findOne(
    id: number,
    user: any,
  ) {
    const proyecto =
      await this.proyectosRepository.findOne(
        {
          where: { id },

          withDeleted: true,

          relations: [
            'usuarios',
            'clientes',
          ],
        },
      );

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

  // =========================================
  // CREAR
  // =========================================

  async create(
    dto: CreateProyectoDto,
    user: any,
  ) {
    // 1. Buscamos la entidad completa del usuario que está logueado usando su ID (user.sub)
    const usuarioLogueado = await this.usuariosRepository.findOne({
      where: { id: user.sub },
    });

    // 2. Creamos el proyecto asociándole el usuario adentro del arreglo de 'usuarios'
    const proyecto = this.proyectosRepository.create({
      ...dto,
      activo: true,
      estado: 'activo',
      usuarios: usuarioLogueado ? [usuarioLogueado] : [], // <-- Se auto-asigna acá
    });

    // 3. Guardamos en la base de datos relacional
    return this.proyectosRepository.save(
      proyecto,
    );
  }

  // =========================================
  // EDITAR
  // =========================================

  async update(
    id: number,
    dto: CreateProyectoDto,
    user: any,
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

  // =========================================
  // DESACTIVAR
  // =========================================

  async remove(
    id: number,
    user: any,
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

  // =========================================
  // REACTIVAR
  // =========================================

  async restore(id: number, user: any) {
    // 1. Buscamos el proyecto
    const proyecto = await this.proyectosRepository.findOne({
      where: { id },
      withDeleted: true, // Importante para encontrar el borrado
      relations: ['usuarios'],
    });

    if (!proyecto) throw new NotFoundException('Proyecto no encontrado');

    // 2. FORZAR la limpieza del deletedAt manualmente
    // Esto es más efectivo que solo .restore() si tu configuración es estricta
    await this.proyectosRepository.update(id, { 
      deletedAt: null,
      activo: true,
      estado: 'activo'
    } as any);

    // 3. Asegurar el vínculo con el usuario (la lógica que ya tenías)
    const yaEstaAsignado = proyecto.usuarios?.some((u) => u.id === user.sub);
    if (!yaEstaAsignado) {
      const usuarioLogueado = await this.usuariosRepository.findOne({ where: { id: user.sub } });
      if (usuarioLogueado) {
        proyecto.usuarios = [...(proyecto.usuarios || []), usuarioLogueado];
        await this.proyectosRepository.save(proyecto);
      }
    }

    return { message: 'Proyecto reactivado correctamente' };
  }

  // =========================================
  // ASIGNAR USUARIOS
  // =========================================

  async asignarUsuarios(
    proyectoId: number,
    usuariosIds: number[],
  ) {
    const proyecto =
      await this.proyectosRepository.findOne(
        {
          where: {
            id: proyectoId,
          },

          relations: ['usuarios'],
        },
      );

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

  // =========================================
  // ASIGNAR CLIENTES
  // =========================================

  async asignarClientes(
    proyectoId: number,
    clientesIds: number[],
  ) {
    const proyecto =
      await this.proyectosRepository.findOne(
        {
          where: {
            id: proyectoId,
          },

          relations: ['clientes'],
        },
      );

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

  // =========================================
  // RESUMEN
  // =========================================

  async getResumen(
    id: number,
    user: any,
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

  // =========================================
  // PRD
  // =========================================

  async getPrd(
    id: number,
    user: any,
  ) {
    const proyecto =
      await this.findOne(
        id,
        user,
      );

    return {
      proyectoId: proyecto.id,

      nombre: proyecto.nombre,

      descripcion:
        proyecto.descripcion,

      mensaje:
        'PRD pendiente de implementación IA',
    };

  }

  async findInactivos(user: any) {
    return this.proyectosRepository.find({
      where: { 
        activo: false 
      },
      withDeleted: true, // Esto es clave para ver los que tienen el soft-delete
      relations: ['usuarios'],
    });
  }
}