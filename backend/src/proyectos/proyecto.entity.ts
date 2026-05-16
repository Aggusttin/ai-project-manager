import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  JoinTable,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

import { Usuario } from '../usuarios/usuario.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Prd } from '../prd/prd.entity';
import { UserStory } from '../user-stories/user-story.entity';

@Entity()
export class Proyecto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  descripcion: string;

  @Column({
    default: true,
  })
  activo: boolean;

  @Column({
    default: 'backlog',
  })
  estado: string;

  @Column({
    type: 'int',
    default: 0,
  })
  estimacion_tiempo: number;

  @Column({
    type: 'int',
    default: 0,
  })
  total_puntos_historia: number;

  @CreateDateColumn()
  fecha_creacion: Date;

  // ✅ SOFT DELETE REAL
  @DeleteDateColumn()
  deletedAt?: Date;

  // =========================
  // USUARIOS
  // =========================

  @ManyToMany(
    () => Usuario,
    (usuario) => usuario.proyectos,
  )
  @JoinTable({
    name: 'proyecto_usuarios',
  })
  usuarios: Usuario[];

  // =========================
  // CLIENTES
  // =========================

  @ManyToMany(
    () => Cliente,
    (cliente) => cliente.proyectos,
  )
  @JoinTable({
    name: 'proyecto_clientes',
  })
  clientes: Cliente[];

  // =========================
  // PRD
  // =========================

  @OneToMany(
    () => Prd,
    (prd) => prd.proyecto,
  )
  prds: Prd[];

  // =========================
  // USER STORIES
  // =========================

  @OneToMany(
    () => UserStory,
    (us) => us.proyecto,
  )
  userStories: UserStory[];
}