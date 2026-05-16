"use client";

import { useDraggable } from "@dnd-kit/core";

export default function KanbanCard({
  historia,
}: any) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: historia.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-xl p-4 shadow cursor-grab active:cursor-grabbing"
    >
      <h4 className="font-bold text-gray-800">
        {historia.titulo}
      </h4>

      <p className="text-sm text-gray-600 mt-2">
        {historia.descripcion}
      </p>

      <div className="flex justify-between mt-4 text-xs">
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
          ⭐ {historia.estimacion}
        </span>

        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
          🔥 {historia.prioridad}
        </span>
      </div>
    </div>
  );
}