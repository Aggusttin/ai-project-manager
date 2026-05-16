import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';

import { Proyecto } from './proyecto.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Cliente } from '../clientes/cliente.entity';
import { UserStory } from '../user-stories/user-story.entity'; // 👈 IMPORTANTE

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proyecto,
      Usuario,
      Cliente,
      UserStory, 
    ]),
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [ProyectosService],
})
export class ProyectosModule {}