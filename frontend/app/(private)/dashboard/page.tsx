"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { proyectosService, Proyecto } from "@/services/proyectos.service";
import { dashboardService, DashboardResponse } from "@/services/dashboard.service";

export default function Dashboard() {
  useAuth();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [estado, setEstado] = useState("Esperando proyecto");

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (proyectoId !== null) {
      cargarDashboard(proyectoId);
    }
  }, [proyectoId]);

  const cargarProyectos = async () => {
    setLoadingProyectos(true);
    try {
      const data = await proyectosService.getProjects();
      setProyectos(data);
      if (data.length > 0) {
        setProyectoId(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast.error("No se pudieron cargar los proyectos");
    } finally {
      setLoadingProyectos(false);
    }
  };

  const cargarDashboard = async (id: number) => {
    setLoadingDashboard(true);
    setEstado("Consultando dashboard...");
    setDashboard(null);

    try {
      const data = await dashboardService.obtenerDashboard(id);
      setDashboard(data);
      setEstado("Dashboard cargado");
    } catch (error: any) {
      setEstado("Error al cargar dashboard");
      console.error("Error obteniendo dashboard:", error);
      toast.error(
        error?.response?.data?.message ||
          "No se pudo cargar el dashboard. Revise el backend."
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Dashboard IA</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Consultá las métricas reales del proyecto desde el backend.
          </p>
        </div>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow mb-6">
        <label className="block text-sm font-semibold mb-2">Proyecto</label>
        <select
          value={proyectoId ?? ""}
          onChange={(e) => setProyectoId(Number(e.target.value))}
          className="w-full border p-3 rounded-xl text-black"
        >
          {loadingProyectos ? (
            <option value="">Cargando proyectos...</option>
          ) : (
            proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))
          )}
        </select>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Estado del flujo</h2>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Estado actual</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{estado}</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <MetricCard titulo="Total de historias" valor={dashboard?.totalHistorias ?? 0} />
            <MetricCard titulo="Total de puntos" valor={dashboard?.puntosTotales ?? 0} />
          </div>

          <div className="mt-6 space-y-4">
            <StateCard
              estado="Backlog"
              count={dashboard?.porEstado?.backlog?.count ?? 0}
              puntos={dashboard?.porEstado?.backlog?.puntos ?? 0}
            />
            <StateCard
              estado="En progreso"
              count={dashboard?.porEstado?.en_progreso?.count ?? 0}
              puntos={dashboard?.porEstado?.en_progreso?.puntos ?? 0}
            />
            <StateCard
              estado="Aprobadas"
              count={dashboard?.porEstado?.aprobada?.count ?? 0}
              puntos={dashboard?.porEstado?.aprobada?.puntos ?? 0}
            />
            <StateCard
              estado="Terminadas"
              count={dashboard?.porEstado?.done?.count ?? 0}
              puntos={dashboard?.porEstado?.done?.puntos ?? 0}
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Métricas del proyecto</h2>
          {loadingDashboard ? (
            <p>Cargando métricas...</p>
          ) : dashboard ? (
            <div className="space-y-4">
              <MetricCard titulo="Total de historias" valor={dashboard.totalHistorias} />
              <MetricCard titulo="Total de puntos" valor={dashboard.puntosTotales} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              <p className="font-medium">Seleccioná un proyecto para ver los datos.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{valor}</p>
    </div>
  );
}

function StateCard({ estado, count, puntos }: { estado: string; count: number; puntos: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-gray-500">{estado}</p>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <span className="text-2xl font-semibold text-gray-900">{count}</span>
        <span className="text-sm text-gray-500">{puntos} pts</span>
      </div>
    </div>
  );
}
