import { api } from '@/lib/api';

export interface DashboardResponse {
  totalHistorias: number;
  puntosTotales: number;
  porEstado: Record<string, {
    count: number;
    puntos: number;
  }>;
}

export const dashboardService = {
  async obtenerDashboard(proyectoId: number): Promise<DashboardResponse> {
    const response = await api.get(`/user-stories/dashboard/${proyectoId}`);
    return response.data as DashboardResponse;
  },
};
