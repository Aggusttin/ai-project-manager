import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contexto } from './contexto.entity';

import { ContextosService } from './contextos.service';
import { ContextosController } from './contextos.controller';

import { RecursosModule } from '../recursos/recursos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contexto,
    ]),
    RecursosModule,
  ],

  controllers: [
    ContextosController,
  ],

  providers: [
    ContextosService,
  ],

  exports: [
    ContextosService,
  ],
})
export class ContextosModule {}