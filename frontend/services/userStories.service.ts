import { api } from "@/lib/api";

export interface UserStory {
  id: number;

  titulo: string;

  descripcion: string;

  prioridad?: number;

  estimacion?: number;

  estado:
    | "BACKLOG"
    | "EN_PROGRESO"
    | "APROBADA";

  proyectoId?: number;
}

export const userStoriesService = {
  // ==================================================
  // OBTENER POR PROYECTO
  // ==================================================

  async getByProyecto(
    proyectoId: number,
  ): Promise<UserStory[]> {
    const response = await api.get(
      `/user-stories/proyecto/${proyectoId}`,
    );

    return response.data;
  },

  // ==================================================
  // CREAR
  // ==================================================

  async create(data: Partial<UserStory>) {
    const response = await api.post(
      "/user-stories",
      data,
    );

    return response.data;
  },

  // ==================================================
  // ACTUALIZAR
  // ==================================================

  async update(
    id: number,
    data: Partial<UserStory>,
  ) {
    const response = await api.patch(
      `/user-stories/${id}`,
      data,
    );

    return response.data;
  },

  // ==================================================
  // DELETE
  // ==================================================

  async remove(id: number) {
    const response = await api.delete(
      `/user-stories/${id}`,
    );

    return response.data;
  },
};