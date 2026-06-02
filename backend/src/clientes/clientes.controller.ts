import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ClientesService } from './clientes.service';

import { CreateClienteDto } from './dto/create-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  // ======================================================
  // CREAR
  // ======================================================

  @Post()
  create(
    @Body()
    createClienteDto: CreateClienteDto,
  ) {
    return this.clientesService.create(
      createClienteDto,
    );
  }

  // ======================================================
  // LISTAR
  // ======================================================

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // ======================================================
  // VER UNO
  // ======================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.clientesService.findOne(
      +id,
    );
  }

  // ======================================================
  // EDITAR
  // ======================================================

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<CreateClienteDto>,
  ) {
    return this.clientesService.update(
      +id,
      data,
    );
  }

  // ======================================================
  // DESACTIVAR
  // ======================================================

  @Patch(':id/delete')
  deactivate(
    @Param('id') id: string,
  ) {
    return this.clientesService.deactivate(
      +id,
    );
  }

  // ======================================================
  // REACTIVAR
  // ======================================================

  @Patch(':id/restore')
  restore(
    @Param('id') id: string,
  ) {
    return this.clientesService.restore(
      +id,
    );
  }
}