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

export enum EstadoFlujo {
  CONFIGURACION = 'CONFIGURACION',
  CARGA_INFORMACION = 'CARGA_INFORMACION',
  TRANSCRIPCION = 'TRANSCRIPCION',
  ESPERANDO_VALIDACION_HISTORIAS = 'ESPERANDO_VALIDACION_HISTORIAS',
  HISTORIAS_CANONICAS = 'HISTORIAS_CANONICAS',
  ESPERANDO_VALIDACION_ESTIMACIONES = 'ESPERANDO_VALIDACION_ESTIMACIONES',
  APROBADO_FINAL = 'APROBADO_FINAL',
  RESULTADOS_REGISTRADOS = 'RESULTADOS_REGISTRADOS',
  PRD_GENERADO = 'PRD_GENERADO',
}

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

  // ✅ NUEVO: Campo para controlar el flujo de trabajo
  @Column({
    type: 'enum',
    enum: EstadoFlujo,
    default: EstadoFlujo.CONFIGURACION,
  })
  estadoFlujo: EstadoFlujo;

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