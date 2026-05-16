"use client";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import { useAuth } from "@/hooks/useAuth";

export default function UserStoriesPage() {
  useAuth();

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800">
          User Stories
        </h1>

        <p className="text-gray-500">
          Gestión visual del backlog
        </p>
      </div>

      <KanbanBoard proyectoId={1} />
    </div>
  );
}