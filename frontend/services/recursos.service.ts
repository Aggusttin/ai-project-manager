import { api } from '@/lib/api';

export interface Recurso {
  id: number;
  nombre: string;
  url_path: string;
  tipo: string;
  metadata: { size: number; mimetype: string };
  proyecto_id: number;
  user_id: number;
  fecha_creacion: string;
}

export const recursosService = {
  async getByProyecto(proyectoId: number): Promise<Recurso[]> {
    const response = await api.get(`/recursos/proyecto/${proyectoId}`);
    return response.data;
  },

  async uploadFile(proyectoId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('proyecto_id', proyectoId.toString());

    const response = await api.post('/recursos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
