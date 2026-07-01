"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { proyectosService, Proyecto } from "@/services/proyectos.service";
import { roadmapService, RoadmapResponse } from "@/services/roadmap.service";

export default function RoadmapPage() {
  useAuth();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (proyectoId !== null) {
      cargarRoadmap(proyectoId);
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

  const cargarRoadmap = async (id: number) => {
    setLoadingRoadmap(true);
    setRoadmap(null);

    try {
      const data = await roadmapService.obtenerRoadmapPorProyecto(id);
      setRoadmap(data);
    } catch (error: any) {
      console.error("Error cargando roadmap:", error);
      toast.error(
        error?.response?.data?.message ||
          "No se pudo cargar el roadmap. Verificá el backend."
      );
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const renderPlaceholder = (message: string) => (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
      <p className="font-medium">{message}</p>
    </div>
  );

  const renderList = (items: React.ReactNode[], emptyText: string) =>
    items.length > 0 ? <div className="space-y-4">{items}</div> : renderPlaceholder(emptyText);

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Roadmap</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Visualizá el roadmap del proyecto desde el backend sin recalcular datos.
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
          <h2 className="text-xl font-bold mb-4">Resumen del proyecto</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            <div className="space-y-4">
              <DataRow label="Nombre" value={roadmap.proyecto.nombre} />
              <DataRow label="Descripción" value={roadmap.proyecto.descripcion} />
              <DataRow label="Estado" value={roadmap.proyecto.estado} />
              <DataRow label="Estado de flujo" value={roadmap.proyecto.estadoFlujo} />
              <DataRow label="Estimación de tiempo" value={roadmap.proyecto.estimacion_tiempo} />
              <DataRow label="Total puntos historia" value={String(roadmap.proyecto.total_puntos_historia)} />
            </div>
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Resumen del PRD</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            roadmap.prd ? (
              <div className="space-y-4">
                <DataRow label="Título" value={roadmap.prd.titulo} />
                <DataRow label="Versión" value={roadmap.prd.version} />
                <div>
                  <p className="text-sm text-gray-500">Descripción</p>
                  <p className="mt-2 text-gray-900 whitespace-pre-wrap">{roadmap.prd.descripcion}</p>
                </div>
              </div>
            ) : (
              renderPlaceholder("Aún no hay PRD generado para este proyecto.")
            )
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow mt-6">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        {loadingRoadmap ? (
          <p>Cargando roadmap...</p>
        ) : roadmap ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard label="Total historias" value={roadmap.dashboard.totalHistorias} />
            <StatusCard label="Total puntos" value={roadmap.dashboard.puntosTotales} />
            {Object.entries(roadmap.dashboard.porEstado).map(([key, item]) => (
              <StatusCard
                key={key}
                label={formatEstado(key)}
                value={`${item.count} historias • ${item.puntos} pts`}
              />
            ))}
          </div>
        ) : (
          renderPlaceholder("Seleccioná un proyecto para ver el dashboard.")
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] mt-6">
        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Historias canónicas</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            renderList(
              roadmap.historiasCanonicas.map((historia) => (
                <SummaryCard
                  key={historia.id}
                  titulo={historia.titulo}
                  descripcion={historia.descripcion}
                  meta={`Estimación: ${historia.estimacion} pts · Prioridad: ${historia.prioridad}`}
                />
              )),
              "No hay historias canónicas definidas."
            )
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Backlog</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            renderList(
              roadmap.backlog.map((historia) => (
                <SummaryCard
                  key={historia.id}
                  titulo={historia.titulo}
                  descripcion={historia.descripcion}
                  meta={`Estado: ${historia.estado} · Estimación: ${historia.estimacion} pts`}
                />
              )),
              "No hay historias en backlog."
            )
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] mt-6">
        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Historias pendientes</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            renderList(
              roadmap.historiasPendientes.map((historia) => (
                <SummaryCard
                  key={historia.id}
                  titulo={historia.titulo}
                  descripcion={historia.descripcion}
                  meta={`Estado: ${historia.estado} · Estimación: ${historia.estimacion} pts`}
                />
              )),
              "No hay historias pendientes."
            )
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Historias aprobadas</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            renderList(
              roadmap.historiasAprobadas.map((historia) => (
                <SummaryCard
                  key={historia.id}
                  titulo={historia.titulo}
                  descripcion={historia.descripcion}
                  meta={`Estado: ${historia.estado} · Estimación: ${historia.estimacion} pts`}
                />
              )),
              "No hay historias aprobadas."
            )
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow mt-6">
        <h2 className="text-xl font-bold mb-4">Sprints</h2>
        {loadingRoadmap ? (
          <p>Cargando roadmap...</p>
        ) : roadmap ? (
          roadmap.sprints.length > 0 ? (
            <div className="space-y-4">
              {roadmap.sprints.map((sprint) => (
                <div key={sprint.sprint} className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="font-semibold text-gray-900">{sprint.sprint}</p>
                    <p className="text-sm text-gray-500">Total: {sprint.totalEstimacion} pts</p>
                  </div>
                  <div className="space-y-2">
                    {sprint.historias.map((historia) => (
                      <div key={historia.id} className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="font-semibold text-gray-900">{historia.titulo}</p>
                        <p className="text-sm text-gray-500">Estimación: {historia.estimacion} pts</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            renderPlaceholder("No hay sprints planificados.")
          )
        ) : (
          renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] mt-6">
        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Dependencias</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            renderList(
              roadmap.dependencias.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <p className="font-semibold text-gray-900">{item.titulo}</p>
                  <p className="text-sm text-gray-500">
                    Depende de: {item.dependencias.length > 0 ? item.dependencias.join(", ") : 'Sin dependencias'}
                  </p>
                </div>
              )),
              "No hay dependencias registradas."
            )
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Riesgos</h2>
          {loadingRoadmap ? (
            <p>Cargando roadmap...</p>
          ) : roadmap ? (
            roadmap.riesgos.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {roadmap.riesgos.map((riesgo, index) => (
                  <li key={index}>{riesgo}</li>
                ))}
              </ul>
            ) : (
              renderPlaceholder("No se detectaron riesgos.")
            )
          ) : (
            renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
          )}
        </section>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow mt-6">
        <h2 className="text-xl font-bold mb-4">Próximos pasos</h2>
        {loadingRoadmap ? (
          <p>Cargando roadmap...</p>
        ) : roadmap ? (
          roadmap.proximosPasos.length > 0 ? (
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              {roadmap.proximosPasos.map((paso, index) => (
                <li key={index}>{paso}</li>
              ))}
            </ol>
          ) : (
            renderPlaceholder("No hay próximos pasos definidos.")
          )
        ) : (
          renderPlaceholder("Seleccioná un proyecto para ver el roadmap.")
        )}
      </section>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-gray-900">{value}</p>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-3 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function SummaryCard({ titulo, descripcion, meta }: { titulo: string; descripcion: string; meta: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-gray-900">{titulo}</p>
      <p className="text-sm text-gray-500 mt-2">{descripcion}</p>
      <p className="mt-3 text-xs text-gray-500">{meta}</p>
    </div>
  );
}

function formatEstado(key: string) {
  switch (key) {
    case 'backlog':
      return 'Backlog';
    case 'en_progreso':
      return 'En progreso';
    case 'aprobada':
      return 'Aprobada';
    case 'done':
      return 'Terminadas';
    default:
      return key.replace(/_/g, ' ');
  }
}
