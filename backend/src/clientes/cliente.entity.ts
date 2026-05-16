import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  razon_social: string;

  @Column({ unique: true })
  cuit: string;

  @Column()
  telefono: string;

  @Column()
  email: string;

  @Column()
  direccion: string;

  @Column()
  provincia: string;

  @Column()
  ciudad: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  // ❌ SIN JoinTable
  @ManyToMany(() => Proyecto, (proyecto) => proyecto.clientes)
  proyectos: Proyecto[];
}