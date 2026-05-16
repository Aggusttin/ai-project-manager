import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';

import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('proyectos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  // =========================================================
  // GET ALL
  // =========================================================

  @Get()
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  findAll(@Request() req) {
    return this.proyectosService.findAll(req.user);
  }

  // =========================================================
  // GET ONE
  // =========================================================

  @Get(':id')
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.proyectosService.findOne(id, req.user);
  }

  // =========================================================
  // CREATE
  // =========================================================

  @Post()
  @Roles('superadmin', 'admin_proyecto')
  create(
    @Body() dto: CreateProyectoDto,
    @Request() req,
  ) {
    return this.proyectosService.create(dto, req.user);
  }

  // =========================================================
  // UPDATE
  // =========================================================

  @Patch(':id')
  @Roles('superadmin', 'admin_proyecto')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProyectoDto,
    @Request() req,
  ) {
    return this.proyectosService.update(
      id,
      dto,
      req.user,
    );
  }

  // =========================================================
  // DELETE
  // =========================================================

  @Delete(':id')
  @Roles('superadmin', 'admin_proyecto')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.proyectosService.remove(
      id,
      req.user,
    );
  }

  // =========================================================
  // RESTORE
  // =========================================================

  @Patch(':id/restore')
  @Roles('superadmin')
  restore(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.proyectosService.restore(
      id,
      req.user,
    );
  }

  // =========================================================
  // ASIGNAR USUARIOS
  // =========================================================

  @Post(':id/asignar-usuarios')
  @Roles('superadmin', 'admin_proyecto')
  asignarUsuarios(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { usuariosIds: number[] },
  ) {
    return this.proyectosService.asignarUsuarios(
      id,
      body.usuariosIds,
    );
  }

  // =========================================================
  // ASIGNAR CLIENTES
  // =========================================================

  @Post(':id/asignar-clientes')
  @Roles('superadmin', 'admin_proyecto')
  asignarClientes(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { clientesIds: number[] },
  ) {
    return this.proyectosService.asignarClientes(
      id,
      body.clientesIds,
    );
  }

  // =========================================================
  // RESUMEN
  // =========================================================

  @Get(':id/resumen')
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  getResumen(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.proyectosService.getResumen(
      id,
      req.user,
    );
  }

  // =========================================================
  // PRD
  // =========================================================

  @Get(':id/prd')
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  getPrd(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.proyectosService.getPrd(
      id,
      req.user,
    );
  }
}