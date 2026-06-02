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
  // ======================================================
  // ID
  // ======================================================

  @PrimaryGeneratedColumn()
  id: number;

  // ======================================================
  // DATOS EMPRESA
  // ======================================================

  @Column()
  razon_social: string;

  @Column({
    unique: true,
  })
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

  // ======================================================
  // ESTADO
  // ======================================================

  @Column({
    default: true,
  })
  activo: boolean;

  // ======================================================
  // FECHA CREACION
  // ======================================================

  @CreateDateColumn()
  fecha_creacion: Date;

  // ======================================================
  // RELACIONES
  // ======================================================

  @ManyToMany(
    () => Proyecto,
    (proyecto) => proyecto.clientes,
  )
  proyectos: Proyecto[];
}