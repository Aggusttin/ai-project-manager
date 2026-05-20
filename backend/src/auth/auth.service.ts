import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from '../usuarios/usuario.entity';
import { MailService } from './mail.service';
import { Rol } from '../roles/rol.entity';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,

    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,

    private readonly mailService: MailService,
  ) {}

  // =========================================================
  // VALIDAR USUARIO
  // =========================================================

  async validateUser(email: string, pass: string) {
    try {
      console.log('EMAIL RECIBIDO:', email);

      const user = await this.usuariosRepository.findOne({
        where: { email },
        relations: ['rol'],
      });
      
      console.log('USUARIO ENCONTRADO:', user);

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      if (user.emailValidado === false) {
        throw new UnauthorizedException(
          'Debes validar tu correo electrónico para iniciar sesión.',
        );
      }

      if (!user.activo) {
        throw new UnauthorizedException(
          'Tu cuenta fue desactivada.',
        );
      }

      const isMatch = await bcrypt.compare(
        pass,
        user.password,
      );
      
      console.log('PASSWORD MATCH:', isMatch);

      if (!isMatch) {
        throw new UnauthorizedException(
          'Credenciales inválidas',
        );
      }

      const { password, ...result } = user;

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error en la validación',
      );
    }
  }

  // =========================================================
  // LOGIN (Corregido)
  // =========================================================

  async login(user: any) {
    try {
      // Extraemos de forma segura el texto del rol
      const rol =
        typeof user.rol === 'object' && user.rol !== null
          ? user.rol?.nombre
          : user.rol;

      if (!rol) {
        throw new InternalServerErrorException(
          'El usuario no tiene rol asignado',
        );
      }

      const payload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        rol, 
      };

      // 🔑 SOLUCIÓN: Usamos "as any" para esquivar la restricción estricta de sobrecarga de TS
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'claveSecretaDeEmergencia123',
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
      });

      return {
        access_token: token,

        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          username: user.username,
          email: user.email,
          rol,
        },
      };
    } catch (error) {
      // Dejamos el log activo por seguridad
      this.logger.error('Error interno en login:', error);
      
      throw new InternalServerErrorException(
        'Error al generar el token',
      );
    }
  }

  // =========================================================
  // REGISTER
  // =========================================================

  async register(body: any) {
    try {
      const {
        username,
        password,
        nombre,
        apellido,
        email,
      } = body;

      const existingUser =
        await this.usuariosRepository.findOne({
          where: [{ email }, { username }],
        });

      if (existingUser) {
        throw new BadRequestException(
          'El usuario o email ya existe',
        );
      }

      // 🔥 ROL POR DEFECTO
      const rol = await this.rolRepository.findOne({
        where: { nombre: 'desarrollador' },
      });

      if (!rol) {
        throw new InternalServerErrorException(
          'No existe el rol "desarrollador" en la base de datos',
        );
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10,
      );

      // 🔥 CÓDIGO VALIDACIÓN EMAIL
      const codigo = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const usuario =
        this.usuariosRepository.create({
          username,
          password: hashedPassword,
          nombre,
          apellido,
          email,

          activo: true,

          emailValidado: false,

          rol,

          resetCode: codigo,

          resetCodeExpires: new Date(
            Date.now() + 10 * 60 * 1000,
          ),
        });

      await this.usuariosRepository.save(usuario);

      // 🔥 ENVÍA MAIL
      await this.mailService.enviarCodigoRecuperacion(
        email,
        codigo,
      );

      this.logger.log(
        `Código de validación para ${email}: ${codigo}`,
      );

      return {
        message:
          'Usuario registrado. Revisá tu email para validar la cuenta.',
      };
    } catch (error) {
      this.logger.error(
        'ERROR REGISTER:',
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  // =========================================================
  // VALIDAR EMAIL
  // =========================================================

  async verifyEmail(
    email: string,
    codigo: string,
  ) {
    const usuario =
      await this.usuariosRepository.findOne({
        where: { email },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    if (usuario.resetCode !== codigo) {
      throw new BadRequestException(
        'Código inválido',
      );
    }

    if (
      !usuario.resetCodeExpires ||
      new Date() > usuario.resetCodeExpires
    ) {
      throw new BadRequestException(
        'Código expirado',
      );
    }

    usuario.emailValidado = true;

    usuario.resetCode = null;

    usuario.resetCodeExpires = null;

    await this.usuariosRepository.save(usuario);

    return {
      message: 'Email validado correctamente',
    };
  }

  // =========================================================
  // REENVIAR CÓDIGO
  // =========================================================

  async resendVerificationCode(email: string) {
    const usuario =
      await this.usuariosRepository.findOne({
        where: { email },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    const codigo = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    usuario.resetCode = codigo;

    usuario.resetCodeExpires = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    await this.usuariosRepository.save(usuario);

    this.logger.log(
      `Reenvío código para ${email}: ${codigo}`,
    );

    await this.mailService.enviarCodigoRecuperacion(
      email,
      codigo,
    );

    return {
      message: 'Código reenviado correctamente',
    };
  }

  // =========================================================
  // REQUEST PASSWORD RESET
  // =========================================================

  async requestPasswordReset(email: string) {
    try {
      const usuario =
        await this.usuariosRepository.findOne({
          where: { email },
        });

      if (!usuario) {
        return {
          message:
            'Si el email existe, se envió un código',
        };
      }

      const codigo = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const expiracion = new Date();

      expiracion.setMinutes(
        expiracion.getMinutes() + 10,
      );

      usuario.resetCode = codigo;

      usuario.resetCodeExpires = expiracion;

      await this.usuariosRepository.save(usuario);

      await this.mailService.enviarCodigoRecuperacion(
        email,
        codigo,
      );

      return {
        message:
          'Si el email existe, se envió un código',
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al solicitar recuperación',
      );
    }
  }

  // =========================================================
  // VALIDAR RESET CODE
  // =========================================================

  async validateResetCode(
    email: string,
    codigo: string,
  ) {
    const usuario =
      await this.usuariosRepository.findOne({
        where: { email },
      });

    if (!usuario || !usuario.resetCode) {
      throw new BadRequestException(
        'Código inválido',
      );
    }

    if (usuario.resetCode !== codigo) {
      throw new BadRequestException(
        'Código incorrecto',
      );
    }

    if (
      !usuario.resetCodeExpires ||
      new Date() > usuario.resetCodeExpires
    ) {
      throw new BadRequestException(
        'Código expirado',
      );
    }

    return {
      message: 'Código válido',
    };
  }

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  async resetPassword(
    email: string,
    codigo: string,
    nuevaPassword: string,
  ) {
    await this.validateResetCode(
      email,
      codigo,
    );

    const usuario =
      await this.usuariosRepository.findOne({
        where: { email },
      });

    if (!usuario) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    const hashed = await bcrypt.hash(
      nuevaPassword,
      10,
    );

    usuario.password = hashed;

    usuario.resetCode = null;

    usuario.resetCodeExpires = null;

    await this.usuariosRepository.save(usuario);

    return {
      message: 'Contraseña actualizada',
    };
  }
}