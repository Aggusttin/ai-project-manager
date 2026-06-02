import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Cliente } from './cliente.entity';

import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  // ======================================================
  // CREAR CLIENTE
  // ======================================================

  async create(
    createClienteDto: CreateClienteDto,
  ): Promise<Cliente> {
    const nuevoCliente =
      this.clienteRepository.create(
        createClienteDto,
      );

    return await this.clienteRepository.save(
      nuevoCliente,
    );
  }

  // ======================================================
  // LISTAR CLIENTES
  // ======================================================

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      relations: ['proyectos'],
    });
  }

  // ======================================================
  // VER UN CLIENTE
  // ======================================================

  async findOne(
    id: number,
  ): Promise<Cliente> {
    const cliente =
      await this.clienteRepository.findOne({
        where: { id },
        relations: ['proyectos'],
      });

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${id} no encontrado`,
      );
    }

    return cliente;
  }

  // ======================================================
  // EDITAR CLIENTE
  // ======================================================

  async update(
    id: number,
    data: Partial<Cliente>,
  ): Promise<Cliente> {
    const cliente =
      await this.findOne(id);

    Object.assign(cliente, data);

    return await this.clienteRepository.save(
      cliente,
    );
  }

  // ======================================================
  // DESACTIVAR CLIENTE
  // ======================================================

  async deactivate(
    id: number,
  ): Promise<Cliente> {
    const cliente =
      await this.findOne(id);

    cliente.activo = false;

    return await this.clienteRepository.save(
      cliente,
    );
  }

  // ======================================================
  // REACTIVAR CLIENTE
  // ======================================================

  async restore(
    id: number,
  ): Promise<Cliente> {
    const cliente =
      await this.findOne(id);

    cliente.activo = true;

    return await this.clienteRepository.save(
      cliente,
    );
  }
}