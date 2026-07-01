"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { proyectosService, Proyecto } from "@/services/proyectos.service";
import { prdService, Prd } from "@/services/prd.service";

export default function PrdPage() {
  useAuth();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [prd, setPrd] = useState<Prd | null>(null);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingPrd, setLoadingPrd] = useState(false);
  const [estado, setEstado] = useState("No generado");

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (proyectoId !== null) {
      obtenerPrd(proyectoId);
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

  const obtenerPrd = async (id: number) => {
    setLoadingPrd(true);
    setEstado("Consultando PRD...");
    setPrd(null);

    try {
      const data = await prdService.obtenerPrdPorProyecto(id);
      setPrd(data);
      setEstado("PRD disponible");
    } catch (error: any) {
      setEstado("No generado");

      if (error?.response?.status === 404) {
        toast.error("No existe PRD para este proyecto.");
        return;
      }

      console.error("Error obteniendo PRD:\n", error);
      toast.error(
        "No se pudo cargar el PRD. Verificá la conexión con el backend."
      );
    } finally {
      setLoadingPrd(false);
    }
  };

  const generarPrd = async () => {
    if (proyectoId === null) {
      return toast.error("Seleccioná un proyecto primero");
    }

    setLoadingPrd(true);
    setEstado("Generando PRD...");
    setPrd(null);

    try {
      const data = await prdService.obtenerPrdPorProyecto(proyectoId);
      setPrd(data);
      setEstado("PRD generado");
      toast.success("PRD generado correctamente");
    } catch (error: any) {
      setEstado("Error en generación");
      console.error("Error generando PRD:\n", error);
      toast.error(
        error?.response?.data?.message ||
          "Error al generar PRD. Revisa el backend o Gemini."
      );
    } finally {
      setLoadingPrd(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">PRD</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Generá y revisá el PRD del proyecto directamente desde el backend.
          </p>
        </div>

        <button
          onClick={generarPrd}
          disabled={loadingPrd || proyectoId === null}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loadingPrd ? "Generando PRD..." : "Generar / Consultar PRD"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="bg-white p-6 rounded-2xl shadow">
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

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
              <div className="text-xs uppercase text-gray-500 font-bold tracking-wide">
                Estado del procesamiento
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">{estado}</div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
              <div className="text-xs uppercase text-gray-500 font-bold tracking-wide">
                Última consulta
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">
                {loadingPrd ? "Cargando..." : prd ? "PRD disponible" : "Pendiente"}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Detalle del PRD</h2>

          {loadingPrd ? (
            <p>Cargando PRD...</p>
          ) : prd ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-sm text-gray-500">Título</span>
                <p className="text-lg font-semibold text-gray-900">{prd.titulo}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-gray-500">Descripción</span>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {prd.descripcion}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <span className="text-sm text-gray-500">Versión</span>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{prd.version}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <span className="text-sm text-gray-500">Fecha de creación</span>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {new Date(prd.fecha_creacion).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              <p className="font-medium">Aún no hay PRD disponible.</p>
              <p className="text-sm mt-2">Presioná "Generar / Consultar PRD" para obtenerlo.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
