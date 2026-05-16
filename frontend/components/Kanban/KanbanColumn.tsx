"use client";

import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

interface Props {
  id: string;
  titulo: string;
  historias: any[];
}

export default function KanbanColumn({
  id,
  titulo,
  historias,
}: Props) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 rounded-xl p-4 min-h-[500px]"
    >
      <h3 className="font-black mb-4 text-gray-800">
        {titulo}
      </h3>

      <div className="space-y-3">
        {historias.map((historia) => (
          <KanbanCard
            key={historia.id}
            historia={historia}
          />
        ))}
      </div>
    </div>
  );
}