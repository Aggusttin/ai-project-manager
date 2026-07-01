import { api } from '@/lib/api';

export interface Contexto {
  id: number;
  proyectoId: number;
  contenido: string;
  fechaCreacion: string;
}

export const contextosService = {
  async procesarProyecto(proyectoId: number) {
    const response = await api.post(
      `/contextos/proyecto/${proyectoId}/procesar`,
    );

    return response.data as Contexto;
  },

  async obtenerPorProyecto(proyectoId: number) {
    const response = await api.get(
      `/contextos/proyecto/${proyectoId}`,
    );

    return response.data as Contexto;
  },
};
