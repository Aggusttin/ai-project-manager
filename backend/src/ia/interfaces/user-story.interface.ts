export interface UserStoryIA {
  titulo: string;

  descripcion: string;

  prioridad: 'Alta' | 'Media' | 'Baja';

  criteriosAceptacion: string[];
}