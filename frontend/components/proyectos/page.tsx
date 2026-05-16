"use client";

import {
  useEffect,
  useState,
} from "react";

import { api } from "@/lib/api";

import { useAuth } from "@/hooks/useAuth";

import RoleGuard from "@/components/RoleGuard";

import { permisos } from "@/lib/permisos";

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

export default function ProyectosPage() {
  useAuth();

  const [proyectos, setProyectos] =
    useState<Proyecto[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [nombre, setNombre] =
    useState("");

  const [
    descripcion,
    setDescripcion,
  ] = useState("");

  // =========================================================
  // FETCH
  // =========================================================

  const fetchProyectos =
    async () => {
      try {
        const res =
          await api.get(
            "/proyectos"
          );

        setProyectos(res.data);
      } catch (err) {
        console.error(
          "Error al traer proyectos",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProyectos();
  }, []);

  // =========================================================
  // CREAR
  // =========================================================

  const handleCrearProyecto =
    async () => {
      if (!nombre.trim()) {
        alert(
          "El nombre es obligatorio"
        );

        return;
      }

      try {
        await api.post(
          "/proyectos",
          {
            nombre,
            descripcion,
          }
        );

        setNombre("");

        setDescripcion("");

        setMostrarFormulario(
          false
        );

        fetchProyectos();
      } catch (err) {
        console.error(
          "Error al crear proyecto",
          err
        );
      }
    };

  // =========================================================
  // ELIMINAR
  // =========================================================

  const handleEliminar =
    async (id: number) => {
      if (
        !confirm(
          "¿Eliminar proyecto?"
        )
      )
        return;

      try {
        // 🔥 IMPORTANTE
        await api.delete(
          `/proyectos/${id}`
        );

        fetchProyectos();
      } catch (err) {
        console.error(
          "Error eliminando proyecto",
          err
        );
      }
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Proyectos
      </h1>

      <RoleGuard
        roles={
          permisos.crearProyecto
        }
      >
        <button
          onClick={() =>
            setMostrarFormulario(
              true
            )
          }
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nuevo Proyecto
        </button>
      </RoleGuard>

      {mostrarFormulario && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <input
            placeholder="Nombre"
            className="w-full mb-3 p-2 border rounded"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value
              )
            }
          />

          <input
            placeholder="Descripción"
            className="w-full mb-3 p-2 border rounded"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
          />

          <button
            onClick={
              handleCrearProyecto
            }
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Crear
          </button>
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-4">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {p.nombre}
                </p>

                <p className="text-sm text-gray-600">
                  {p.descripcion}
                </p>
              </div>

              <RoleGuard
                roles={
                  permisos.eliminarProyecto
                }
              >
                <button
                  onClick={() =>
                    handleEliminar(
                      p.id
                    )
                  }
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </RoleGuard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}