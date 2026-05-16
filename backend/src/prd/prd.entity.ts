import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';
import { UserStory } from '../user-stories/user-story.entity';

@Entity('prds')
export class Prd {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  version: string; // Ej: "1.0.0"

  @CreateDateColumn()
  fecha_creacion: Date;

  @Column()
  proyecto_id: number;

  @ManyToOne(() => Proyecto)
  proyecto: Proyecto;

  // RELACIÓN INTERMEDIA: Un PRD contiene muchas User Stories
  @ManyToMany(() => UserStory)
  @JoinTable({ name: 'prd_user_stories' }) // Tabla intermedia automática
  userStories: UserStory[];
}