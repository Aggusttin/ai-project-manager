import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { RecursosService } from './recursos.service';

import { CreateRecursoDto } from './dto/create-recurso.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

@Controller('recursos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecursosController {
  constructor(
    private readonly recursosService: RecursosService,
  ) {}

  @Post()
  @Roles(
    'superadmin',
    'admin_proyecto',
    'desarrollador',
  )
  create(
    @Body() dto: CreateRecursoDto,
    @Request() req,
  ) {
    return this.recursosService.create(
      dto,
      req.user,
    );
  }

  @Post('upload')
  @Roles(
    'superadmin',
    'admin_proyecto',
    'desarrollador',
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 100000,
            ) +
            extname(file.originalname);

          callback(
            null,
            uniqueName,
          );
        },
      }),
    }),
  )
  async upload(
    @UploadedFile()
    file: Express.Multer.File,

    @Body('proyecto_id')
    proyectoId: string,

    @Request()
    req,
  ) {
    console.log('FILE:', file);

    console.log('PROYECTO_ID:', proyectoId);

    if (!file) {
      throw new BadRequestException(
        'Debe enviar un archivo en el campo "file"',
      );
    }

    if (!proyectoId) {
      throw new BadRequestException(
        'Debe enviar proyecto_id',
      );
    }

    return this.recursosService.createFromUpload(
      file,
      Number(proyectoId),
      req.user,
    );
  }

  @Get('proyecto/:id')
  @Roles(
    'superadmin',
    'admin_proyecto',
    'desarrollador',
  )
  findAllByProyecto(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.recursosService.findAllByProyecto(
      id,
    );
  }
}