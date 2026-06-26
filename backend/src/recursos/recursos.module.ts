import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Recurso } from './recurso.entity';

import { RecursosService } from './recursos.service';
import { RecursosController } from './recursos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recurso,
    ]),
  ],

  providers: [
    RecursosService,
  ],

  controllers: [
    RecursosController,
  ],

  exports: [
    RecursosService,
  ],
})
export class RecursosModule {}