"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import KanbanBoard from "@/components/Kanban/KanbanBoard";
import UserStoryModal from "@/components/user-stories/UserStoryModal";
import { useUserStories } from "@/hooks/useUserStories";

interface Proyecto {
  id: number;
  nombre: string;
}

export default function UserStoriesPage() {
  useAuth();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Fuerza la recarga del Kanban cuando se crea una historia
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { crearHistoria } = useUserStories(proyectoId);

  // ======================================================
  // CARGAR PROYECTOS
  // ======================================================

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    setCargando(true);

    try {
      const res = await api.get("/proyectos");

      setProyectos(res.data);

      if (res.data.length > 0) {
        setProyectoId(res.data[0].id);
      }
    } catch (error) {
      console.error("Error cargando proyectos:", error);
    } finally {
      setCargando(false);
    }
  };

  // ======================================================
  // CREAR USER STORY
  // ======================================================

  const handleCrearHistoria = async (
    data: Record<string, unknown>
  ) => {
    await crearHistoria({
      ...data,
      estado: "BACKLOG",
    });

    setModalOpen(false);

    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-800">
            User Stories
          </h1>

          <p className="text-gray-500 mt-2">
            Gestión visual Agile
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl font-bold shadow"
        >
          + Nueva Historia
        </button>
      </div>

      {/* SELECT PROYECTO */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Proyecto
        </label>

        {cargando ? (
          <p className="text-gray-500 text-sm animate-pulse">
            Cargando proyectos...
          </p>
        ) : (
          <select
            value={proyectoId ?? ""}
            onChange={(e) =>
              setProyectoId(Number(e.target.value))
            }
            className="w-full border p-3 rounded-xl text-black"
          >
            {proyectos.map((proyecto) => (
              <option
                key={proyecto.id}
                value={proyecto.id}
              >
                {proyecto.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* KANBAN */}
      {proyectoId !== null && (
        <KanbanBoard
          key={refreshTrigger}
          proyectoId={proyectoId}
        />
      )}

      {/* MODAL */}
      <UserStoryModal
        abierto={modalOpen}
        onClose={() => setModalOpen(false)}
        onGuardar={handleCrearHistoria}
        proyectoId={proyectoId}
      />
    </div>
  );
}