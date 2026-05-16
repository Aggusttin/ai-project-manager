import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException, 
  HttpException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  // 1. EL MÉTODO QUE TE FALTABA (Para el Controller)
  async create(createUsuarioDto: CreateUsuarioDto): Promise<any> {
    try {
      const existe = await this.usuariosRepository.findOne({ 
        where: [{ email: createUsuarioDto.email }, { username: createUsuarioDto.username }] 
      });
      if (existe) throw new BadRequestException('El email o username ya existen');

      const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

      const usuario = this.usuariosRepository.create({
        ...createUsuarioDto,
        password: hashedPassword,
        activo: true,
        rol: { id: createUsuarioDto.rolId || 3 } as any, 
      });

      const guardado = await this.usuariosRepository.save(usuario);
      const { password, ...usuarioSinPassword } = guardado;
      return usuarioSinPassword;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  // 2. EL MÉTODO QUE TE FALTABA (Para el AuthService/Login)
  async findByUsername(username: string): Promise<Usuario | null> {
    try {
      return await this.usuariosRepository.findOne({
        where: { username, activo: true },
        relations: ['rol'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar usuario');
    }
  }

  // 3. Método para la tabla del Superadmin (Trae todos)
  async findAll(): Promise<Partial<Usuario>[]> {
    try {
      const usuarios = await this.usuariosRepository.find({
        relations: ['rol'],
        order: { id: 'DESC' }
      });
      return usuarios.map(({ password, ...userSinPass }) => userSinPass);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  // 4. Soft Delete
  async remove(id: number): Promise<any> {
    try {
      const usuario = await this.usuariosRepository.findOne({ where: { id } });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      usuario.activo = false; 
      await this.usuariosRepository.save(usuario);
      return { message: 'Usuario desactivado correctamente' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al eliminar usuario');
    }
  }

  // 5. Restaurar
  async restore(id: number): Promise<any> {
    try {
      const usuario = await this.usuariosRepository.findOne({ where: { id } });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      usuario.activo = true; 
      await this.usuariosRepository.save(usuario);
      return { message: 'Usuario restaurado correctamente' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al restaurar usuario');
    }
  }
}