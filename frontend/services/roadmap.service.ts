import { api } from '@/lib/api';

export interface RoadmapProject {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  estadoFlujo: string;
  estimacion_tiempo: string;
  total_puntos_historia: number;
}

export interface RoadmapPrd {
  id: number;
  titulo: string;
  descripcion: string;
  version: string;
}

export interface RoadmapDashboard {
  totalHistorias: number;
  puntosTotales: number;
  porEstado: Record<string, {
    count: number;
    puntos: number;
  }>;
}

export interface RoadmapHistoriaResumen {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: number;
  estimacion: number;
  estado: string;
}

export interface RoadmapHistoriaCanonica extends RoadmapHistoriaResumen {
  estimacionValidada: boolean;
  dependencias: Array<{
    id: number;
    titulo: string;
  }>;
}

export interface RoadmapDependencia {
  id: number;
  titulo: string;
  dependencias: number[];
}

export interface RoadmapSprint {
  sprint: string;
  historias: Array<{
    id: number;
    titulo: string;
    estimacion: number;
  }>;
  totalEstimacion: number;
}

export interface RoadmapResponse {
  proyecto: RoadmapProject;
  prd: RoadmapPrd | null;
  dashboard: RoadmapDashboard;
  historiasCanonicas: RoadmapHistoriaCanonica[];
  backlog: RoadmapHistoriaResumen[];
  historiasAprobadas: RoadmapHistoriaResumen[];
  historiasPendientes: RoadmapHistoriaResumen[];
  totalHistorias: number;
  totalPuntos: number;
  estimacionTotal: number;
  dependencias: RoadmapDependencia[];
  sprints: RoadmapSprint[];
  riesgos: string[];
  proximosPasos: string[];
}

export const roadmapService = {
  async obtenerRoadmapPorProyecto(proyectoId: number): Promise<RoadmapResponse> {
    const response = await api.get(`/proyectos/${proyectoId}/roadmap`);
    return response.data as RoadmapResponse;
  },
};
