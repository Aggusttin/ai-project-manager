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
    const userRole =
      typeof user.rol === 'object'
        ? user.rol?.nombre
        : user.rol;

    // ✅ SUPERADMIN VE TODO

    if (userRole === 'superadmin') {
      return this.proyectosRepository.find({
        withDeleted: true,

        relations: [
          'usuarios',
          'clientes',
        ],

        order: {
          activo: 'DESC',
          fecha_creacion: 'DESC',
        },
      });
    }

    // ✅ OTROS SOLO ACTIVOS

    return this.proyectosRepository
      .createQueryBuilder(
        'proyecto',
      )
      .leftJoinAndSelect(
        'proyecto.usuarios',
        'usuario',
      )
      .leftJoinAndSelect(
        'proyecto.clientes',
        'cliente',
      )
      .where(
        'usuario.id = :userId',
        {
          userId: user.sub,
        },
      )
      .andWhere(
        'proyecto.activo = true',
      )
      .orderBy(
        'proyecto.fecha_creacion',
        'DESC',
      )
      .getMany();
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
    const proyecto =
      this.proyectosRepository.create({
        ...dto,

        activo: true,

        estado: 'activo',
      });

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

  async restore(
    id: number,
    user: any,
  ) {
    const proyecto =
      await this.proyectosRepository.findOne(
        {
          where: { id },

          withDeleted: true,

          relations: ['usuarios'],
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

    await this.proyectosRepository.restore(
      id,
    );

    proyecto.activo = true;

    proyecto.estado = 'activo';

    return this.proyectosRepository.save(
      proyecto,
    );
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
}