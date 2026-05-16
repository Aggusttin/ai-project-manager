import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { PrdService } from './prd.service';
import { CreatePrdDto } from './dto/create-prd.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('prd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrdController {
  constructor(private readonly prdService: PrdService) {}

  @Post()
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  create(@Body() dto: CreatePrdDto) {
    return this.prdService.create(dto);
  }

  @Get(':id')
  @Roles('superadmin', 'admin_proyecto', 'desarrollador')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prdService.findOne(id);
  }
}