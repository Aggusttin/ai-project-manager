import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // ✅ Si la ruta no tiene roles definidos → permitir acceso
    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // DEBUG 
    console.log('--- ROLES GUARD DEBUG ---');
    console.log('User en request:', user);
    console.log('Roles permitidos:', rolesPermitidos);

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Soporta ambos formatos: string u objeto
    const userRole =
      typeof user.rol === 'object' ? user.rol?.nombre : user.rol;

    console.log('Rol detectado:', userRole);

    if (!userRole) {
      throw new ForbiddenException('Usuario sin rol');
    }

    const tienePermiso = rolesPermitidos.includes(userRole);

    if (!tienePermiso) {
      throw new ForbiddenException(
        `Acceso denegado: tu rol (${userRole}) no tiene permiso`,
      );
    }

    return true;
  }
}