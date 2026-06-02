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
  const [historias, setHistorias] =
    useState<any[]>([]);

  // ======================================================
  // CARGAR HISTORIAS
  // ======================================================

  useEffect(() => {
    if (proyectoId) {
      fetchHistorias();
    }
  }, [proyectoId]);

  const fetchHistorias =
    async () => {
      try {
        const res =
          await api.get(
            `/user-stories/proyecto/${proyectoId}`
          );

        setHistorias(res.data);
      } catch (error) {
        console.error(
          "Error cargando historias:",
          error
        );
      }
    };

  // ======================================================
  // DRAG & DROP
  // ======================================================

  const handleDragEnd = async (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over) return;

    const historiaId = Number(
      active.id
    );

    const nuevoEstado =
      String(over.id);

    const historiaActual =
      historias.find(
        (h) => h.id === historiaId
      );

    // evitar mover a misma columna
    if (
      historiaActual?.estado ===
      nuevoEstado
    ) {
      return;
    }

    try {
      await api.patch(
        `/user-stories/${historiaId}`,
        {
          estado: nuevoEstado,
        }
      );

      // refrescar
      fetchHistorias();
    } catch (error) {
      console.error(
        "Error moviendo historia:",
        error
      );
    }
  };

  // ======================================================
  // COLUMNAS
  // ======================================================

  const backlog =
    historias.filter(
      (h) =>
        h.estado === "backlog"
    );

  const enProgreso =
    historias.filter(
      (h) =>
        h.estado ===
        "en_progreso"
    );

  const aprobada =
    historias.filter(
      (h) =>
        h.estado === "aprobada"
    );

  return (
    <DndContext
      onDragEnd={
        handleDragEnd
      }
    >
      <div className="grid grid-cols-3 gap-6 mt-6">
        <KanbanColumn
          id="backlog"
          titulo="📋 Backlog"
          historias={backlog}
        />

        <KanbanColumn
          id="en_progreso"
          titulo="🚧 En progreso"
          historias={
            enProgreso
          }
        />

        <KanbanColumn
          id="aprobada"
          titulo="✅ Aprobada"
          historias={aprobada}
        />
      </div>
    </DndContext>
  );
}