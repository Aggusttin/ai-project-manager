"use client";

import {
  useEffect,
  useState,
} from "react";

import { api } from "@/lib/api";

import { useAuth } from "@/hooks/useAuth";

import RoleGuard from "@/components/auth/RoleGuard";

import { permisos } from "@/lib/permisos";

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  activo: boolean;
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

  const [modoEdicion, setModoEdicion] =
    useState(false);

  const [
    proyectoEditando,
    setProyectoEditando,
  ] = useState<number | null>(null);

  const [nombre, setNombre] =
    useState("");

  const [
    descripcion,
    setDescripcion,
  ] = useState("");

  // =========================
  // FETCH
  // =========================

  const fetchProyectos =
    async () => {
      try {
        const res =
          await api.get("/proyectos");

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

  // =========================
  // RESET FORM
  // =========================

  const resetFormulario = () => {
    setNombre("");
    setDescripcion("");

    setModoEdicion(false);

    setProyectoEditando(null);

    setMostrarFormulario(false);
  };

  // =========================
  // CREAR
  // =========================

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

        resetFormulario();

        fetchProyectos();
      } catch (err) {
        console.error(
          "Error al crear proyecto",
          err
        );
      }
    };

  // =========================
  // EDITAR
  // =========================

  const abrirEdicion = (
    proyecto: Proyecto
  ) => {
    setModoEdicion(true);

    setProyectoEditando(
      proyecto.id
    );

    setNombre(proyecto.nombre);

    setDescripcion(
      proyecto.descripcion
    );

    setMostrarFormulario(true);
  };

  const handleEditarProyecto =
    async () => {
      if (!proyectoEditando) return;

      try {
        await api.patch(
          `/proyectos/${proyectoEditando}`,
          {
            nombre,
            descripcion,
          }
        );

        resetFormulario();

        fetchProyectos();
      } catch (err) {
        console.error(
          "Error editando proyecto",
          err
        );
      }
    };

  // =========================
  // DESACTIVAR
  // =========================

  const handleDesactivar =
    async (id: number) => {
      const confirmar = confirm(
        "¿Desactivar proyecto?"
      );

      if (!confirmar) return;

      try {
        await api.patch(
          `/proyectos/${id}/delete`
        );

        fetchProyectos();
      } catch (err) {
        console.error(
          "Error desactivando proyecto",
          err
        );
      }
    };

  // =========================
  // REACTIVAR
  // =========================

  const handleReactivar =
    async (id: number) => {
      const confirmar = confirm(
        "¿Reactivar proyecto?"
      );

      if (!confirmar) return;

      try {
        await api.patch(
          `/proyectos/${id}/restore`
        );

        fetchProyectos();
      } catch (err) {
        console.error(
          "Error reactivando proyecto",
          err
        );
      }
    };

  // =========================
  // UI
  // =========================

  return (
    <div className="p-8">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          Proyectos
        </h1>

        <RoleGuard
          roles={
            permisos.crearProyecto
          }
        >
          <button
            onClick={() => {
              resetFormulario();

              setMostrarFormulario(
                true
              );
            }}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            + Nuevo Proyecto
          </button>
        </RoleGuard>
      </div>

      {/* FORMULARIO */}

      {mostrarFormulario && (
        <div className="mb-8 bg-white border rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            {modoEdicion
              ? "Editar Proyecto"
              : "Nuevo Proyecto"}
          </h2>

          <input
            placeholder="Nombre"
            className="w-full mb-4 p-3 border rounded-lg"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value
              )
            }
          />

          <textarea
            placeholder="Descripción"
            className="w-full mb-4 p-3 border rounded-lg"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
          />

          <div className="flex gap-3">
            <button
              onClick={
                modoEdicion
                  ? handleEditarProyecto
                  : handleCrearProyecto
              }
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              {modoEdicion
                ? "Guardar Cambios"
                : "Crear Proyecto"}
            </button>

            <button
              onClick={
                resetFormulario
              }
              className="bg-gray-300 px-5 py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-5">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className={`p-5 border rounded-2xl flex justify-between items-center transition ${
                p.activo
                  ? "bg-white"
                  : "bg-red-50 border-red-300"
              }`}
            >
              {/* INFO */}

              <div>
                <h3 className="font-bold text-xl">
                  {p.nombre}
                </h3>

                <p className="text-gray-600 mt-1">
                  {p.descripcion}
                </p>

                <p
                  className={`mt-3 text-sm font-bold ${
                    p.activo
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {p.activo
                    ? "ACTIVO"
                    : "INACTIVO"}
                </p>
              </div>

              {/* BOTONES */}

              <div className="flex gap-3">
                <RoleGuard
                  roles={
                    permisos.editarProyecto
                  }
                >
                  <button
                    onClick={() =>
                      abrirEdicion(p)
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Editar
                  </button>
                </RoleGuard>

                <RoleGuard
                  roles={
                    permisos.eliminarProyecto
                  }
                >
                  {p.activo ? (
                    <button
                      onClick={() =>
                        handleDesactivar(
                          p.id
                        )
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleReactivar(
                          p.id
                        )
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Reactivar
                    </button>
                  )}
                </RoleGuard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}