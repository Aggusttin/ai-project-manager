import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ContextosService } from './contextos.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('contextos')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class ContextosController {
  constructor(
    private readonly contextosService: ContextosService,
  ) {}

  @Post('proyecto/:id/procesar')
  @Roles(
    'superadmin',
    'admin_proyecto',
  )
  procesar(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.contextosService.procesarProyecto(
      id,
    );
  }

  @Get('proyecto/:id')
  @Roles(
    'superadmin',
    'admin_proyecto',
    'desarrollador',
  )
  obtener(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.contextosService.obtenerContexto(
      id,
    );
  }
}