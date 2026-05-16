import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity()
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string; // 'superadmin' | 'admin'

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}