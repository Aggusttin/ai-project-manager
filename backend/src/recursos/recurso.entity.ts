import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('recursos')
export class Recurso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  url_path: string;

  @Column()
  tipo: string; 

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Para guardar info extra de la IA en el futuro

  @CreateDateColumn()
  fecha_creacion: Date;

  // Relación con Proyecto: Un proyecto tiene muchos recursos
  @ManyToOne(() => Proyecto, (proyecto) => proyecto.id)
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: Proyecto;

  @Column()
  proyecto_id: number;

  // Relación con Usuario: Un usuario sube muchos recursos
  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  @JoinColumn({ name: 'user_id' })
  user: Usuario;

  @Column()
  user_id: number;
}