import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';

import { RecursosService } from './recursos.service';
import { CreateRecursoDto } from './dto/create-recurso.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('recursos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecursosController {
  constructor(private readonly recursosService: RecursosService) {}

  @Post()
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  create(@Body() dto: CreateRecursoDto, @Request() req) {
    return this.recursosService.create(dto, req.user);
  }

  @Get('proyecto/:id')
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  findAllByProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.recursosService.findAllByProyecto(id);
  }
}