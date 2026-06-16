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

  @Column({
    type: 'enum',
    enum: EstadoUS,
    default: EstadoUS.BACKLOG,
  })
  estado: EstadoUS;

  @Column({ default: false })
  esCanonica: boolean; 

  @Column({ type: 'text', nullable: true })
  comentarioValidacion: string;

  @Column({ type: 'float', nullable: true })
  confianza_US: number;

  @Column({ type: 'float', nullable: true })
  confianza_Estimacion: number;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.userStories)
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: Proyecto;

  @ManyToMany(() => UserStory)
  @JoinTable({ name: 'us_dependencias' })
  dependencias: UserStory[];

  // ✅ Campo necesario para la Validación Humana 2
  @Column({ default: false })
  estimacionValidada: boolean;
}