import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Contexto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  proyectoId: number;

  @Column('text')
  contenido: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}