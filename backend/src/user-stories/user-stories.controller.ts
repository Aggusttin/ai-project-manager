import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';

import { UserStoriesService } from './user-stories.service';
import { GeminiService } from '../ia/services/gemini.service';
import { CreateUserStoryDto } from './dto/create-user-story.dto';
import { UpdateUserStoryDto } from './dto/update-user-story.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Controller('user-stories')
export class UserStoriesController {
  constructor(
    private readonly userStoriesService: UserStoriesService,
    private readonly geminiService: GeminiService,
  ) {}

  // =========================================================
  // CREAR
  // =========================================================

  @Post()
  create(@Body() dto: CreateUserStoryDto) {
    return this.userStoriesService.create(dto);
  }

  // ✅ NUEVO: Endpoint para validación humana
  @Patch(':id/confirmar')
  async confirmarHistoria(
    @Param('id') id: string,
    @Body() body: { esCanonica: boolean; comentario?: string },
  ) {
    return await this.userStoriesService.confirmarHistoria(Number(id), body);
  }

  @Post('generar-ia/:proyectoId')
  async generarDesdeIA(
    @Param('proyectoId') proyectoId: string,
    @Body() data: { historias: any[] },
  ) {
    return await this.userStoriesService.createManyFromIA(
      Number(proyectoId),
      data.historias,
    );
  }

  @Post('automatizar-generacion/:proyectoId')
  async automatizarGeneracion(@Param('proyectoId') proyectoId: string) {
    return await this.userStoriesService.generarHistoriasDesdePrd(Number(proyectoId));
  }

  // =========================================================
  // DIAGNÓSTICO IA
  // =========================================================

  @Get('diagnostico-ia')
  async obtenerModelos() {
    return await this.geminiService.listarModelosDisponibles();
  }

  // =========================================================
  // LISTAR POR PROYECTO
  // =========================================================

  @Get('proyecto/:id')
  findByProyecto(@Param('id') id: string) {
    return this.userStoriesService.findByProyecto(Number(id));
  }

  // =========================================================
  // OBTENER UNA
  // =========================================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userStoriesService.findOne(Number(id));
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  @Get('dashboard/:proyectoId')
  async obtenerDashboard(@Param('proyectoId') proyectoId: string) {
    return await this.userStoriesService.obtenerDashboard(Number(proyectoId));
  }

  // =========================================================
  // ACTUALIZAR (GENÉRICO)
  // =========================================================

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserStoryDto,
  ) {
    return this.userStoriesService.update(Number(id), body);
  }

  // =========================================================
  // ACTUALIZAR ESTADO (ESPECÍFICO)
  // =========================================================

  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoDto,
  ) {
    return this.userStoriesService.cambiarEstado(
      Number(id),
      updateEstadoDto.nuevoEstado,
    );
  }

  // =========================================================
  // ELIMINAR
  // =========================================================

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userStoriesService.remove(Number(id));
  }

  // =========================================================
  // ESTIMACIÓN AUTOMÁTICA
  // =========================================================

  @Post('estimar-proyecto/:proyectoId')
  async estimarProyecto(@Param('proyectoId') proyectoId: string) {
    return await this.userStoriesService.estimarHistoriasCanonicas(Number(proyectoId));
  }

  @Patch(':id/confirmar-estimacion')
  async confirmarEstimacion(
    @Param('id') id: string,
    @Body() body: { estimacionConfirmada: number; comentario?: string },
  ) {
    return await this.userStoriesService.confirmarEstimacion(Number(id), body);
  }
}