"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import {
  DndContext,
  DragEndEvent,
} from "@dnd-kit/core";

import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard({
  proyectoId,
}: {
  proyectoId: number;
}) {
  const [historias, setHistorias] = useState<any[]>([]);

  useEffect(() => {
    fetchHistorias();
  }, []);

  const fetchHistorias = async () => {
    try {
      const res = await api.get(
        `/user-stories/proyecto/${proyectoId}`
      );

      setHistorias(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragEnd = async (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over) return;

    const historiaId = active.id;
    const nuevoEstado = over.id;

    try {
      await api.patch(
        `/user-stories/${historiaId}`,
        {
          estado: nuevoEstado,
        }
      );

      fetchHistorias();
    } catch (error) {
      console.error(error);
    }
  };

  const columnas = {
    backlog: historias.filter(
      (h) => h.estado === "backlog"
    ),

    ready: historias.filter(
      (h) => h.estado === "ready"
    ),

    in_progress: historias.filter(
      (h) => h.estado === "in_progress"
    ),

    done: historias.filter(
      (h) => h.estado === "done"
    ),
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4 mt-6">
        <KanbanColumn
          id="backlog"
          titulo="📋 Backlog"
          historias={columnas.backlog}
        />

        <KanbanColumn
          id="ready"
          titulo="🟡 Ready"
          historias={columnas.ready}
        />

        <KanbanColumn
          id="in_progress"
          titulo="🚧 En progreso"
          historias={columnas.in_progress}
        />

        <KanbanColumn
          id="done"
          titulo="✅ Done"
          historias={columnas.done}
        />
      </div>
    </DndContext>
  );
}