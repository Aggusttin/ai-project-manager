"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { proyectosService, Proyecto } from "@/services/proyectos.service";
import { contextosService, Contexto } from "@/services/contextos.service";

export default function ContextosPage() {
  useAuth();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [contexto, setContexto] = useState<Contexto | null>(null);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingContexto, setLoadingContexto] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    if (proyectoId !== null) {
      cargarContexto(proyectoId);
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

  const cargarContexto = async (id: number) => {
    setLoadingContexto(true);
    setContexto(null);

    try {
      const data = await contextosService.obtenerPorProyecto(id);
      setContexto(data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setContexto(null);
        return;
      }

      console.error("Error cargando contexto:", error);
      toast.error("No se pudo obtener el contexto");
    } finally {
      setLoadingContexto(false);
    }
  };

  const procesarContexto = async () => {
    if (proyectoId === null) {
      return toast.error("Seleccioná un proyecto primero");
    }

    setProcesando(true);

    try {
      await contextosService.procesarProyecto(proyectoId);
      toast.success("Contexto generado correctamente");
      cargarContexto(proyectoId);
    } catch (error) {
      console.error("Error procesando contexto:", error);
      toast.error("No se pudo procesar el contexto");
    } finally {
      setProcesando(false);
    }
  };

  const estado = procesando
    ? "Procesando..."
    : contexto
    ? "Procesado"
    : "No procesado";

  const contenidoLength = contexto
    ? contexto.contenido.length
    : 0;

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Contextos</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Procesá los recursos del proyecto para generar el contexto que usa la IA.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] w-full lg:w-auto">
          <button
            onClick={procesarContexto}
            disabled={procesando || proyectoId === null}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {procesando ? "Procesando..." : "Procesar contexto"}
          </button>
        </div>
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
                Estado
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">{estado}</div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
              <div className="text-xs uppercase text-gray-500 font-bold tracking-wide">
                Longitud del contexto
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">
                {contenidoLength.toLocaleString()} caracteres
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Resultado del contexto</h2>

          {loadingContexto ? (
            <p>Cargando contexto...</p>
          ) : contexto ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-sm text-gray-500">Fecha de generación</span>
                <p className="text-base text-gray-900 font-medium">
                  {new Date(contexto.fechaCreacion).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-gray-500">Contenido</span>
                <pre className="whitespace-pre-wrap break-words rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900">
                  {contexto.contenido}
                </pre>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              <p className="font-medium">Aún no existe contexto para este proyecto.</p>
              <p className="text-sm mt-2">Procesá el proyecto para generar el contexto desde los recursos cargados.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
