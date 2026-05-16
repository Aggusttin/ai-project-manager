import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';

import { Proyecto } from '../proyectos/proyecto.entity';

// ✅ ENUM CONTROLADO
export enum EstadoUS {
  BACKLOG = 'backlog',
  EN_PROGRESO = 'en_progreso',
  APROBADA = 'aprobada',
  DONE = 'done',
}

@Entity('user_stories')
export class UserStory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'int', default: 0 })
  estimacion: number;

  @Column({ type: 'int', default: 1 })
  prioridad: number;

  // 🔥 IMPORTANTE: ENUM en DB
  @Column({
    type: 'enum',
    enum: EstadoUS,
    default: EstadoUS.BACKLOG,
  })
  estado: EstadoUS;

  @Column({ type: 'float', nullable: true })
  confianza_US: number;

  @Column({ type: 'float', nullable: true })
  confianza_Estimacion: number;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @ManyToOne(() => Proyecto)
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: Proyecto;

  @ManyToMany(() => UserStory)
  @JoinTable({ name: 'us_dependencias' })
  dependencias: UserStory[];
}