import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Rol } from '../roles/rol.entity';
import { MailService } from './mail.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 🔥 IMPORTANTE
import { JwtModuleOptions } from '@nestjs/jwt';

@Module({
  imports: [
    UsuariosModule,
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'supersecretkey',

        signOptions: {
          // 🔥 FIX DEFINITIVO
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    }),

    TypeOrmModule.forFeature([Usuario, Rol]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}