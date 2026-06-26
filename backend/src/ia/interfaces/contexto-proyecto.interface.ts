export interface ContextoProyecto {
  proyectoId: number;

  nombreProyecto: string;

  descripcionProyecto?: string;

  contenido: string;

  archivos: {
    nombreArchivo: string;
    tipo: string;
    contenido: string;
  }[];
}