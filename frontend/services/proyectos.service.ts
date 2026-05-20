import { api } from '../lib/api'; 

// Definimos la interfaz para saber qué datos maneja un proyecto
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  clienteId?: number;
  createdAt: string;
}

export const proyectosService = {
  // 1. Listar todos los proyectos
  getProjects: async (): Promise<Proyecto[]> => {
    const response = await api.get('/proyectos');
    return response.data;
  },

  // 2. Crear un nuevo proyecto
  createProject: async (data: Partial<Proyecto>): Promise<Proyecto> => {
    const response = await api.post('/proyectos', data);
    return response.data;
  },

  // 3. Editar un proyecto existente
  updateProject: async (id: number, data: Partial<Proyecto>): Promise<Proyecto> => {
    const response = await api.patch(`/proyectos/${id}`, data);
    return response.data;
  },

  // 4. Desactivar un proyecto (PATCH /proyectos/:id/delete)
  deactivateProject: async (id: number): Promise<void> => {
    // Cambiamos 'delete' por 'patch' y añadimos '/delete' al final de la ruta
    await api.patch(`/proyectos/${id}/delete`);
  },

  // 5. Reactivar un proyecto desactivado (PATCH /proyectos/:id/restore)
  restoreProject: async (id: number): Promise<Proyecto> => {
    // Cambiamos 'post' por 'patch' y confirmamos la ruta '/restore'
    const response = await api.patch(`/proyectos/${id}/restore`);
    return response.data;
  },

  // 6. Listar proyectos inactivos
  getInactiveProjects: async (): Promise<Proyecto[]> => {
    const response = await api.get('/proyectos/inactivos');
    return response.data;
  },
};