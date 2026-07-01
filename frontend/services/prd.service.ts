import { api } from '@/lib/api';

export interface Prd {
  id: number;
  titulo: string;
  descripcion: string;
  version: string;
  fecha_creacion: string;
  proyecto_id: number;
}

export const prdService = {
  async obtenerPrdPorProyecto(proyectoId: number): Promise<Prd> {
    const response = await api.get(`/proyectos/${proyectoId}/prd`);
    return response.data as Prd;
  },
};
