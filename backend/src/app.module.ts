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

import { ProyectosModule } from './proyectos/proyectos.module';

import { AuthModule } from './auth/auth.module';

import { UsuariosModule } from './usuarios/usuarios.module';

import { ClientesModule } from './clientes/clientes.module';

import { RecursosModule } from './recursos/recursos.module';

import { UserStoriesModule } from './user-stories/user-stories.module';

import { PrdModule } from './prd/prd.module';

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
        ttl: 60000,

        limit: 20,
      },
    ]),

    // =========================================================
    // DATABASE
    // =========================================================

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => {
        return {
          type: 'postgres',

          host: configService.get<string>(
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
        };
      },
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
  ],
})
export class AppModule {}