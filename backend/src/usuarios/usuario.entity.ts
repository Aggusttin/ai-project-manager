import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Rol } from '../roles/rol.entity';
import { Proyecto } from '../proyectos/proyecto.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude() // 🔥 NO se devuelve nunca
  password: string;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true })
  rol: Rol;

  @Column({ default: true })
  activo: boolean;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  emailValidado: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetCodeExpires: Date | null;

  @ManyToMany(() => Proyecto, (proyecto) => proyecto.usuarios)
  proyectos: Proyecto[];
}