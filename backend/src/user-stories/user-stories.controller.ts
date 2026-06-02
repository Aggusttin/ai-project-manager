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

import { CreateUserStoryDto } from './dto/create-user-story.dto';

import { UpdateUserStoryDto } from './dto/update-user-story.dto';

@Controller('user-stories')
export class UserStoriesController {
  constructor(
    private readonly userStoriesService: UserStoriesService,
  ) {}

  // =========================================================
  // CREAR
  // =========================================================

  @Post()
  create(
    @Body()
    dto: CreateUserStoryDto,
  ) {
    return this.userStoriesService.create(
      dto,
    );
  }

  // =========================================================
  // LISTAR POR PROYECTO
  // =========================================================

  @Get('proyecto/:id')
  findByProyecto(
    @Param('id') id: string,
  ) {
    return this.userStoriesService.findByProyecto(
      Number(id),
    );
  }


  // =========================================================
  // OBTENER UNA
  // =========================================================

  @Get(':id')
  findOne(

    @Param('id') id: string,
  ) {
    return this.userStoriesService.findOne(
      Number(id),
    );
  }

  // =========================================================
  // ACTUALIZAR
  // =========================================================

  @Patch(':id')
  update(
    @Param('id') id: string,

    @Body()
    body: UpdateUserStoryDto,
  ) {
    return this.userStoriesService.update(
      Number(id),
      body,
    );
  }

  // =========================================================
  // ELIMINAR
  // =========================================================

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.userStoriesService.remove(
      Number(id),
    );
  }
}