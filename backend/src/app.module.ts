import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  ThrottlerModule,
} from '@nestjs/throttler';

// =========================================================
// MÓDULOS
// =========================================================

import { AuthModule } from './auth/auth.module';

import { UsuariosModule } from './usuarios/usuarios.module';

import { ProyectosModule } from './proyectos/proyectos.module';

import { ClientesModule } from './clientes/clientes.module';

import { RecursosModule } from './recursos/recursos.module';

import { UserStoriesModule } from './user-stories/user-stories.module';

import { PrdModule } from './prd/prd.module';

import { IaModule } from './ia/ia.module';

import { ContextosModule } from './contextos/contextos.module';

@Module({
  imports: [
    // =========================================================
    // ENV
    // =========================================================

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // =========================================================
    // RATE LIMIT
    // =========================================================

   ThrottlerModule.forRoot([
  {
    limit: 20,
    ttl: 60,
  },
]),

    // =========================================================
    // DATABASE
    // =========================================================

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        type: 'postgres',

        host:
          configService.get<string>(
            'DB_HOST',
          ),

        port: Number(
          configService.get<string>(
            'DB_PORT',
          ),
        ),

        username:
          configService.get<string>(
            'DB_USER',
          ),

        password:
          configService.get<string>(
            'DB_PASSWORD',
          ),

        database:
          configService.get<string>(
            'DB_NAME',
          ),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),

    // =========================================================
    // MODULES
    // =========================================================

    AuthModule,

    UsuariosModule,

    ProyectosModule,

    ClientesModule,

    RecursosModule,

    UserStoriesModule,

    PrdModule,

    IaModule,

    ContextosModule,
    
  ],
})
export class AppModule {}