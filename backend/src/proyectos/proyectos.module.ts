import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ProyectosController } from './proyectos.controller';

import { ProyectosService } from './proyectos.service';

import { Proyecto } from './proyecto.entity';

import { Usuario } from '../usuarios/usuario.entity';

import { Cliente } from '../clientes/cliente.entity';

import { UserStory } from '../user-stories/user-story.entity';

import { IaModule } from '../ia/ia.module';
import { ContextosModule } from '../contextos/contextos.module';
import { PrdModule } from '../prd/prd.module';
import { UserStoriesModule } from '../user-stories/user-stories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proyecto,
      Usuario,
      Cliente,
      UserStory,
    ]),

    IaModule,
    ContextosModule,
    PrdModule,
    UserStoriesModule,
  ],

  controllers: [
    ProyectosController,
  ],

  providers: [
    ProyectosService,
  ],

  exports: [
    ProyectosService,
  ],
})
export class ProyectosModule {}