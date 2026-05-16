import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { UserStoriesService } from './user-stories.service';
import { CreateUserStoryDto } from './dto/create-user-story.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('user-stories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserStoriesController {
  constructor(private readonly usService: UserStoriesService) {}

  @Post()
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  create(@Body() dto: CreateUserStoryDto) {
    return this.usService.create(dto);
  }

  @Get('proyecto/:id')
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  findAllByProyecto(@Param('id', ParseIntPipe) id: number) {
    return this.usService.findAllByProyecto(id);
  }

  // 🔥 PASAMOS DTO NORMAL
  @Patch(':id')
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateUserStoryDto>,
  ) {
    return this.usService.update(id, dto);
  }
}