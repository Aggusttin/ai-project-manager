import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

// DTOs
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// 🔐 JWT Guard
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =========================================================
  // LOGIN
  // =========================================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    const user =
      await this.authService.validateUser(
        body.email,
        body.password,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos',
      );
    }

    return this.authService.login(user);
  }

  // =========================================================
  // REGISTER
  // =========================================================

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(
      body,
    );
  }

  // =========================================================
  // REQUEST PASSWORD RESET
  // =========================================================

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestReset(
    @Body() body: RequestResetDto,
  ) {
    return await this.authService.requestPasswordReset(
      body.email,
    );
  }

  // =========================================================
  // VALIDATE RESET CODE
  // =========================================================

  @Post('validate-reset-code')
  @HttpCode(HttpStatus.OK)
  async validateCode(
    @Body() body: ValidateCodeDto,
  ) {
    return await this.authService.validateResetCode(
      body.email,
      body.codigo,
    );
  }

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword(
      body.email,
      body.codigo,
      body.nuevaPassword,
    );
  }

  // =========================================================
  // VERIFY EMAIL
  // =========================================================

  @Post('verify-email')
  verifyEmail(
    @Body()
    body: {
      email: string;
      codigo: string;
    },
  ) {
    return this.authService.verifyEmail(
      body.email,
      body.codigo,
    );
  }

  // =========================================================
  // RESEND VERIFICATION CODE
  // =========================================================

  @Post('resend-code')
  resend(
    @Body()
    body: { email: string },
  ) {
    return this.authService.resendVerificationCode(
      body.email,
    );
  }

  // =========================================================
  // PERFIL PROTEGIDO
  // =========================================================

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  getPerfil(@Request() req) {
    return {
      message: 'Acceso permitido',

      user: req.user,
    };
  }
}