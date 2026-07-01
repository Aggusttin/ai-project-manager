"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { proyectosService, Proyecto } from "@/services/proyectos.service";
import { recursosService, Recurso } from "@/services/recursos.service";
import { toast } from "sonner";

export default function RecursosPage() {
  useAuth();

  const [archivos, setArchivos] = useState<Recurso[]>([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      const data = await proyectosService.getProjects();
      setProyectos(data);
      if (data.length > 0) {
        setProyectoId(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast.error("No se pudieron cargar proyectos");
    }
  };

  useEffect(() => {
    if (proyectoId !== null) {
      fetchRecursos(proyectoId);
    }
  }, [proyectoId]);

  const fetchRecursos = async (id: number) => {
    try {
      setLoading(true);
      const recursos = await recursosService.getByProyecto(id);
      setArchivos(recursos);
    } catch (error) {
      console.error("Error cargando recursos:", error);
      toast.error("No se pudieron cargar los recursos");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!archivoSeleccionado || proyectoId === null) {
      return toast.error("Seleccioná un proyecto y un archivo");
    }

    try {
      setLoading(true);
      await recursosService.uploadFile(proyectoId, archivoSeleccionado);
      toast.success("Recurso subido correctamente");
      setArchivoSeleccionado(null);
      fetchRecursos(proyectoId);
    } catch (error) {
      console.error("Error subiendo recurso:", error);
      toast.error("Error al subir el recurso");
    } finally {
      setLoading(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <h1 className="text-3xl font-black mb-6">Recursos</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="bg-white p-6 rounded-xl shadow">
          <label className="block text-sm font-semibold mb-2">Proyecto</label>
          <select
            value={proyectoId ?? ""}
            onChange={(e) => setProyectoId(Number(e.target.value))}
            className="w-full border p-3 rounded-xl text-black mb-4"
          >
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>

          <label className="block text-sm font-semibold mb-2">Seleccionar archivo</label>
          <input
            type="file"
            onChange={(e) =>
              setArchivoSeleccionado(e.target.files?.[0] || null)
            }
            className="w-full text-sm text-gray-600"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Subiendo..." : "Subir recurso"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Archivos del proyecto</h2>

          {loading ? (
            <p>Cargando recursos...</p>
          ) : archivos.length === 0 ? (
            <p>No hay recursos cargados aún.</p>
          ) : (
            <div className="space-y-4">
              {archivos.map((recurso) => (
                <div key={recurso.id} className="border border-gray-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{recurso.nombre}</p>
                      <p className="text-sm text-gray-500">Tipo: {recurso.tipo}</p>
                      <p className="text-xs text-gray-400">
                        Subido el {new Date(recurso.fecha_creacion).toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={
                        recurso.url_path.startsWith('http')
                          ? recurso.url_path
                          : `${API_URL}${recurso.url_path}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver archivo
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}