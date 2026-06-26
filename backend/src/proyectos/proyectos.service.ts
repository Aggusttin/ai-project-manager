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

    private readonly geminiService: GeminiService,
  ) {}

  async findAll(user: any) {
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
    user: any,
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
    user: any,
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

  async restore(
    id: number,
    user: any,
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
      } as any,
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

  async getPrd(
    id: number,
    user: any,
  ) {
    const proyecto =
      await this.findOne(
        id,
        user,
      );

    return this.geminiService.generarPrd(
      proyecto,
      [],
    );
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